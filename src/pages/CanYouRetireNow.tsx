"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, XCircle, Wallet, LineChart } from "lucide-react";
import AllocationPieChart from "@/components/AllocationPieChart";

// Helper to get total liquid assets from Net Worth data
const getLiquidAssets = () => {
  try {
    const savedData = localStorage.getItem('netWorthData');
    if (!savedData) return 0;
    const data = JSON.parse(savedData);
    return (data.fixedDeposits || 0) + (data.debtFunds || 0) + (data.domesticStocks || 0) + 
           (data.domesticMutualFunds || 0) + (data.internationalFunds || 0) + (data.smallCases || 0) + 
           (data.savingsBalance || 0) + (data.preciousMetals || 0) + (data.cryptocurrency || 0) + (data.reits || 0);
  } catch {
    return 0;
  }
};

// Helper to get annual expenses from Cashflow data
const getAnnualExpenses = () => {
  try {
    const savedData = localStorage.getItem('finance-data');
    if (!savedData) return 0;
    const data = JSON.parse(savedData);
    return ((data.monthlyHouseholdExpense || 0) +
            (data.monthlyPpf || 0) +
            (data.monthlyUlip || 0) +
            (data.monthlyInsurance || 0) +
            (data.monthlyRds || 0) +
            (data.monthlyLoanEMIs || 0) +
            (data.monthlyDonation || 0) +
            (data.monthlyEntertainment || 0) +
            (data.monthlyTravel || 0) +
            (data.monthlyOthers || 0)) * 12;
  } catch {
    return 0;
  }
};

// Helper to get projected corpus
const getProjectedCorpus = () => {
  try {
    const savedData = localStorage.getItem('projectedAccumulatedCorpus');
    return savedData ? JSON.parse(savedData) : 0;
  } catch {
    return 0;
  }
};

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
  const [annualExpenses, setAnnualExpenses] = useState(0);

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
      setLiquidAssets(getLiquidAssets());
      setAnnualExpenses(getAnnualExpenses());
      setProjectedCorpus(getProjectedCorpus());
    };
    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const handleInputChange = (field: keyof RetirementInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleAllocationChange = (category: keyof RetirementInputs["allocations"], value: number) => {
    handleInputChange("allocations", { ...inputs.allocations, [category]: value });
  };

  const handleReturnChange = (category: keyof RetirementInputs["returns"], value: number) => {
    handleInputChange("returns", { ...inputs.returns, [category]: Number(value) });
  };

  const totalStartingCorpus = useMemo(() => liquidAssets + projectedCorpus, [liquidAssets, projectedCorpus]);
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

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Can You Retire Now?</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Liquid Corpus</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(liquidAssets)}</div>
            <p className="text-xs text-muted-foreground">From your Net Worth page.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Corpus at Retirement</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedCorpus)}</div>
            <p className="text-xs text-muted-foreground">From Projected Cashflow page.</p>
          </CardContent>
        </Card>
      </div>

      <Card className={canRetire ? "bg-green-50 dark:bg-green-900/30 border-green-500" : "bg-red-50 dark:bg-red-900/30 border-red-500"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {canRetire ? <CheckCircle className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-red-600" />}
            Verdict: {canRetire ? "Yes, you can likely retire now." : "No, not yet."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-lg">
          <p>Your combined corpus of <strong>{formatCurrency(totalStartingCorpus)}</strong> will last for approximately <strong>{yearsCorpusWillLast} years</strong> (until age {inputs.currentAge + yearsCorpusWillLast}).</p>
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
            <div className="flex justify-between"><span className="text-muted-foreground">Total Starting Corpus:</span><span className="font-bold">{formatCurrency(totalStartingCorpus)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Current Annual Expenses:</span><span className="font-bold">{formatCurrency(annualExpenses)}</span></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Post-Retirement Investment Strategy</CardTitle>
            <CardDescription>Define how your corpus will be allocated and the expected returns for each asset class.</CardDescription>
            <p className={`text-sm pt-2 ${totalAllocation !== 100 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>Total Allocation: {totalAllocation}% {totalAllocation !== 100 && "(Must be 100%)"}</p>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <AllocationPieChart data={inputs.allocations} />
            </div>
            <div className="space-y-6">
              {Object.keys(inputs.allocations).map((key) => {
                const category = key as keyof RetirementInputs["allocations"];
                const allocatedValue = totalStartingCorpus * (inputs.allocations[category] / 100);
                return (
                  <div key={category} className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="capitalize text-md">{category}</Label>
                      <Slider value={[inputs.allocations[category]]} onValueChange={(val) => handleAllocationChange(category, val[0])} min={0} max={100} step={5} />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{inputs.allocations[category]}%</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(allocatedValue)}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`return-${category}`} className="text-xs">Return (%)</Label>
                      <Input id={`return-${category}`} type="number" value={inputs.returns[category]} onChange={(e) => handleReturnChange(category, Number(e.target.value))} />
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