"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, Wallet, LineChart } from "lucide-react";
import {
  getLiquidAssetsFromNetWorth,
  getAnnualExpensesFromFinance,
  getProjectedAccumulatedCorpus,
  getLiquidFutureValueTotal,
  getRetirementCorpusMode,
  setRetirementCorpusMode,
} from "@/utils/localStorageUtils";

interface RetirementInputs {
  currentAge: number;
  lifeExpectancy: number;
  inflation: number;
  allocations: { equity: number; fds: number; bonds: number; cash: number; };
  returns: { equity: number; fds: number; bonds: number; cash: number; };
}

const CanYouRetireNow: React.FC = () => {
  const [liquidAssets, setLiquidAssets] = useState(0);
  const [projectedCorpus, setProjectedCorpus] = useState(0);
  const [liquidFutureValue, setLiquidFutureValue] = useState(0);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [corpusMode, setCorpusMode] = useState<'now' | 'future'>(getRetirementCorpusMode());

  const [inputs, setInputs] = useState<RetirementInputs>(() => {
    const defaultState: RetirementInputs = {
      currentAge: 30,
      lifeExpectancy: 85,
      inflation: 6,
      allocations: { equity: 30, fds: 40, bonds: 25, cash: 5 },
      returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
    };
    return defaultState;
  });

  useEffect(() => {
    const updateData = () => {
      setLiquidAssets(getLiquidAssetsFromNetWorth());
      setAnnualExpenses(getAnnualExpensesFromFinance());
      setProjectedCorpus(getProjectedAccumulatedCorpus());
      setLiquidFutureValue(getLiquidFutureValueTotal());
      setCorpusMode(getRetirementCorpusMode());
    };
    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const handleInputChange = (field: keyof RetirementInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const totalStartingCorpus = useMemo(() => {
    if (corpusMode === 'now') {
      return liquidAssets;
    } else { // corpusMode === 'future'
      return liquidFutureValue + projectedCorpus;
    }
  }, [liquidAssets, liquidFutureValue, projectedCorpus, corpusMode]);

  const totalAllocation = useMemo(() => Object.values(inputs.allocations).reduce((sum, val) => sum + val, 0), [inputs.allocations]);
  
  const weightedAvgReturn = useMemo(() => {
    if (totalAllocation !== 100) return 0;
    return Object.keys(inputs.allocations).reduce((acc, key) => 
      acc + (inputs.allocations[key as keyof typeof inputs.allocations] / 100) * inputs.returns[key as keyof typeof inputs.returns], 0
    );
  }, [inputs.allocations, inputs.returns, totalAllocation]);

  const { yearsCorpusWillLast, canRetire, shortfall } = useMemo(() => {
    if (totalStartingCorpus <= 0 || annualExpenses <= 0 || totalAllocation !== 100) {
      return { yearsCorpusWillLast: 0, canRetire: false, shortfall: annualExpenses * 25 };
    }

    let currentFund = totalStartingCorpus;
    let currentWithdrawal = annualExpenses;
    let years = 0;
    const maxYears = inputs.lifeExpectancy - inputs.currentAge;

    while (currentFund > 0 && years < maxYears) {
      currentFund -= currentWithdrawal;
      if (currentFund <= 0) break;
      currentFund *= (1 + weightedAvgReturn / 100);
      currentWithdrawal *= (1 + inputs.inflation / 100);
      years++;
    }

    const retirementCorpusNeeded = annualExpenses * 25;
    const canRetireStatus = years >= maxYears;
    
    return {
      yearsCorpusWillLast: years,
      canRetire: canRetireStatus,
      shortfall: canRetireStatus ? 0 : Math.max(0, retirementCorpusNeeded - totalStartingCorpus),
    };
  }, [totalStartingCorpus, annualExpenses, inputs, weightedAvgReturn, totalAllocation]);

  useEffect(() => {
    try {
        localStorage.setItem('canRetireNowData', JSON.stringify({
            corpus: totalStartingCorpus,
            annualExpenses: annualExpenses,
            currentAge: inputs.currentAge,
        }));
        setRetirementCorpusMode(corpusMode);
    } catch (error) {
        console.error("Failed to save data for post-retirement page:", error);
    }
  }, [totalStartingCorpus, annualExpenses, inputs.currentAge, corpusMode]);

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
            The verdict is based on whether your 'Total Starting Corpus' is projected to last until your 'Life Expectancy' (age {inputs.lifeExpectancy}) given your 'Current Annual Expenses', 'Inflation', and 'Expected Returns'. It uses a standard financial independence rule (25x annual expenses) to determine the required corpus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-lg">
          <p>Your net corpus of <strong>{formatCurrency(totalStartingCorpus)}</strong> will last for approximately <strong>{yearsCorpusWillLast} years</strong> (until age {inputs.currentAge + yearsCorpusWillLast}).</p>
          {!canRetire && (
            <p>You have a shortfall of approximately <strong>{formatCurrency(shortfall)}</strong> to reach a standard retirement corpus.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retirement Simulation Inputs</CardTitle>
          <CardDescription>Adjust these values to match your expectations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><Label htmlFor="currentAge">Current Age</Label><Input id="currentAge" type="number" value={inputs.currentAge} onChange={(e) => handleInputChange("currentAge", Number(e.target.value))} /></div>
            <div><Label htmlFor="lifeExpectancy">Life Expectancy</Label><Input id="lifeExpectancy" type="number" value={inputs.lifeExpectancy} onChange={(e) => handleInputChange("lifeExpectancy", Number(e.target.value))} /></div>
            <div className="md:col-span-2">
              <Label>Expected Annual Inflation</Label>
              <Slider value={[inputs.inflation]} onValueChange={(val) => handleInputChange("inflation", val[0])} min={4} max={10} step={0.5} />
              <div className="text-center font-medium">{inputs.inflation.toFixed(1)}%</div>
            </div>
          </div>
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between md:col-span-2"><span className="text-muted-foreground">Current Annual Expenses for Retirement:</span><span className="font-bold">{formatCurrency(annualExpenses)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CanYouRetireNow;