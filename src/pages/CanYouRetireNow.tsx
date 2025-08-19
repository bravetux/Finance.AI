"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle } from "lucide-react";
import {
  getLiquidAssetsFromNetWorth,
  getAnnualExpensesFromFinance,
  getProjectedAccumulatedCorpus,
  getLiquidFutureValueTotal,
  getRetirementCorpusMode,
  setRetirementCorpusMode,
  getRetirementData,
} from "@/utils/localStorageUtils";
import AllocationPieChart from "@/components/AllocationPieChart";

interface SimulationInputs {
  allocations: { equity: number; fds: number; bonds: number; cash: number; };
  returns: { equity: number; fds: number; bonds: number; cash: number; };
}

const CanYouRetireNow: React.FC = () => {
  const [liquidAssets, setLiquidAssets] = useState(0);
  const [projectedCorpus, setProjectedCorpus] = useState(0);
  const [liquidFutureValue, setLiquidFutureValue] = useState(0);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [corpusMode, setCorpusMode] = useState<'now' | 'future'>(getRetirementCorpusMode());
  const [withdrawalRate, setWithdrawalRate] = useState(4);

  const [sharedData, setSharedData] = useState({ currentAge: 30, lifeExpectancy: 85, inflation: 6 });
  const [simulationInputs, setSimulationInputs] = useState<SimulationInputs>(() => {
    // These settings are local to this page's simulation
    return {
      allocations: { equity: 30, fds: 40, bonds: 25, cash: 5 },
      returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
    };
  });

  useEffect(() => {
    const updateData = () => {
      setLiquidAssets(getLiquidAssetsFromNetWorth());
      setAnnualExpenses(getAnnualExpensesFromFinance());
      setProjectedCorpus(getProjectedAccumulatedCorpus());
      setLiquidFutureValue(getLiquidFutureValueTotal());
      setCorpusMode(getRetirementCorpusMode());
      
      const retirementData = getRetirementData();
      setSharedData({
        currentAge: retirementData.currentAge,
        lifeExpectancy: retirementData.lifeExpectancy,
        inflation: retirementData.inflation,
      });
    };
    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const handleSimulationInputChange = (field: keyof SimulationInputs, value: any) => {
    setSimulationInputs((prev) => ({ ...prev, [field]: value }));
  };

  const totalStartingCorpus = useMemo(() => {
    if (corpusMode === 'now') {
      return liquidAssets;
    } else {
      return liquidFutureValue + projectedCorpus;
    }
  }, [liquidAssets, liquidFutureValue, projectedCorpus, corpusMode]);

  const totalAllocation = useMemo(() => Object.values(simulationInputs.allocations).reduce((sum, val) => sum + val, 0), [simulationInputs.allocations]);
  
  const weightedAvgReturn = useMemo(() => {
    if (totalAllocation !== 100) return 0;
    return Object.keys(simulationInputs.allocations).reduce((acc, key) => 
      acc + (simulationInputs.allocations[key as keyof typeof simulationInputs.allocations] / 100) * simulationInputs.returns[key as keyof typeof simulationInputs.returns], 0
    );
  }, [simulationInputs.allocations, simulationInputs.returns, totalAllocation]);

  const { yearsCorpusWillLast, canRetire, shortfall } = useMemo(() => {
    if (totalStartingCorpus <= 0 || annualExpenses <= 0 || totalAllocation !== 100) {
      return { yearsCorpusWillLast: 0, canRetire: false, shortfall: annualExpenses * 25 };
    }

    let currentFund = totalStartingCorpus;
    let currentWithdrawal = totalStartingCorpus * 0.04; // Use 4% of the corpus as the initial withdrawal
    let years = 0;
    const maxYears = sharedData.lifeExpectancy - sharedData.currentAge;

    while (currentFund > 0 && years < maxYears) {
      currentFund -= currentWithdrawal;
      if (currentFund <= 0) break;
      currentFund *= (1 + weightedAvgReturn / 100);
      currentWithdrawal *= (1 + sharedData.inflation / 100); // Inflate the withdrawal amount each year
      years++;
    }

    const retirementCorpusNeeded = annualExpenses * 25;
    const canRetireStatus = years >= maxYears;
    
    return {
      yearsCorpusWillLast: years,
      canRetire: canRetireStatus,
      shortfall: canRetireStatus ? 0 : Math.max(0, retirementCorpusNeeded - totalStartingCorpus),
    };
  }, [totalStartingCorpus, annualExpenses, sharedData, weightedAvgReturn, totalAllocation]);

  const annualWithdrawal = useMemo(() => {
    return totalStartingCorpus * (withdrawalRate / 100);
  }, [totalStartingCorpus, withdrawalRate]);

  const monthlyWithdrawal = useMemo(() => {
    return annualWithdrawal / 12;
  }, [annualWithdrawal]);

  const withdrawalSimulationYears = useMemo(() => {
    if (totalStartingCorpus <= 0 || annualWithdrawal <= 0 || totalAllocation !== 100) {
      return 0;
    }

    let currentFund = totalStartingCorpus;
    let currentWithdrawalAmount = annualWithdrawal;
    let years = 0;
    const maxYears = sharedData.lifeExpectancy - sharedData.currentAge;

    while (currentFund > 0 && years < maxYears) {
      currentFund -= currentWithdrawalAmount;
      if (currentFund <= 0) break;
      currentFund *= (1 + weightedAvgReturn / 100);
      currentWithdrawalAmount *= (1 + sharedData.inflation / 100);
      years++;
    }
    
    return years;
  }, [totalStartingCorpus, annualWithdrawal, sharedData, weightedAvgReturn, totalAllocation]);

  useEffect(() => {
    try {
        localStorage.setItem('canRetireNowData', JSON.stringify({
            corpus: totalStartingCorpus,
            annualExpenses: annualExpenses,
            currentAge: sharedData.currentAge,
        }));
        setRetirementCorpusMode(corpusMode);
    } catch (error) {
        console.error("Failed to save data for post-retirement page:", error);
    }
  }, [totalStartingCorpus, annualExpenses, sharedData.currentAge, corpusMode]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Can You Retire Now?</h1>

      <Card>
        <CardHeader>
            <CardTitle>Net Corpus for Retirement</CardTitle>
            <CardDescription>This is the final amount available for your retirement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {corpusMode === 'now' && (
              <div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Liquid Corpus</span>
                      <span className="font-medium">{formatCurrency(liquidAssets)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">From Net Worth page</p>
              </div>
            )}
            {corpusMode === 'future' && (
                <>
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Future Value of Liquid Assets</span>
                            <span className="font-medium">{formatCurrency(liquidFutureValue)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">From Future Value Calculator page</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">+ Projected Corpus</span>
                            <span className="font-medium">{formatCurrency(projectedCorpus)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">From Projected Cashflow page</p>
                    </div>
                </>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Switch
                        id="corpus-mode-toggle"
                        checked={corpusMode === 'future'}
                        onCheckedChange={(checked) => setCorpusMode(checked ? 'future' : 'now')}
                    />
                    <Label htmlFor="corpus-mode-toggle" className="text-muted-foreground">
                        Now or Future
                    </Label>
                </div>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(totalStartingCorpus)}</span>
            </div>
        </CardContent>
      </Card>

      <Card className={canRetire ? "bg-green-50 dark:bg-green-900/30 border-green-500" : "bg-red-50 dark:bg-red-900/30 border-red-500"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {canRetire ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
            Verdict: {canRetire ? "Yes, you can likely retire now." : "No, not yet."}
          </CardTitle>
          <CardDescription>
            The verdict is based on the standard 4% withdrawal rule. It simulates whether your 'Total Starting Corpus' can sustain an initial withdrawal of 4% (adjusted for inflation annually) until your 'Life Expectancy'.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-lg">
          <p>Your net corpus of <strong>{formatCurrency(totalStartingCorpus)}</strong> will last for approximately <strong>{yearsCorpusWillLast} years</strong> (until age {sharedData.currentAge + yearsCorpusWillLast}).</p>
          {!canRetire && (
            <p>You have a shortfall of approximately <strong>{formatCurrency(shortfall)}</strong> to reach a standard retirement corpus.</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4 pt-4 border-t">
          <div className="w-full">
            <Label htmlFor="withdrawal-slider" className="font-semibold">
              Withdrawal Rate Simulation: {withdrawalRate.toFixed(1)}%
            </Label>
            <Slider
              id="withdrawal-slider"
              value={[withdrawalRate]}
              onValueChange={(val) => setWithdrawalRate(val[0])}
              min={1}
              max={10}
              step={0.5}
              className="mt-2"
            />
          </div>
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual Withdrawal:</span>
              <span className="font-bold">{formatCurrency(annualWithdrawal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Withdrawal:</span>
              <span className="font-bold">{formatCurrency(monthlyWithdrawal)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Corpus will last for:</span>
              <span className="font-bold">{withdrawalSimulationYears} years (until age {sharedData.currentAge + withdrawalSimulationYears})</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retirement Simulation Inputs</CardTitle>
          <CardDescription>Adjust these values to match your expectations. Core assumptions are managed on the Retirement Dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><Label htmlFor="currentAge">Current Age</Label><Input id="currentAge" type="number" value={sharedData.currentAge} disabled /></div>
            <div><Label htmlFor="lifeExpectancy">Life Expectancy</Label><Input id="lifeExpectancy" type="number" value={sharedData.lifeExpectancy} disabled /></div>
            <div className="md:col-span-2">
              <Label>Expected Annual Inflation</Label>
              <Input value={`${sharedData.inflation.toFixed(1)}%`} disabled />
            </div>
          </div>
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between md:col-span-2"><span className="text-muted-foreground">Current Annual Expenses for Retirement:</span><span className="font-bold">{formatCurrency(annualExpenses)}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Post-Retirement Investment Strategy</CardTitle>
            <CardDescription>Define how your corpus will be allocated and the expected returns for the simulation.</CardDescription>
            <p className={`text-sm pt-2 ${totalAllocation !== 100 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>Total Allocation: {totalAllocation}% {totalAllocation !== 100 && "(Must be 100%)"}</p>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <AllocationPieChart data={simulationInputs.allocations} />
            </div>
            <div className="space-y-6">
              {Object.keys(simulationInputs.allocations).map((key) => {
                const category = key as keyof SimulationInputs["allocations"];
                return (
                  <div key={category} className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="capitalize text-md">{category}</Label>
                      <Slider value={[simulationInputs.allocations[category]]} onValueChange={(val) => handleSimulationInputChange("allocations", { ...simulationInputs.allocations, [category]: val[0] })} min={0} max={100} step={5} />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{simulationInputs.allocations[category]}%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`return-${category}`} className="text-xs">Return (%)</Label>
                      <Input id={`return-${category}`} type="number" value={simulationInputs.returns[category]} onChange={(e) => handleSimulationInputChange("returns", { ...simulationInputs.returns, [category]: Number(e.target.value) })} />
                    </div>
                  </div>
                );
              })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CanYouRetireNow;