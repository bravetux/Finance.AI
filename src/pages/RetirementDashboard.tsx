"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, Sailboat, Gem, Upload, Download, Trash2, HelpCircle } from "lucide-react";
import AllocationPieChart from "@/components/AllocationPieChart";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RetirementState {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentAnnualExpenses: number;
  inflation: number;
  allocations: {
    equity: number;
    fds: number;
    bonds: number;
    cash: number;
  };
  returns: {
    equity: number;
    fds: number;
    bonds: number;
    cash: number;
  };
}

const getNetWorthData = () => {
    try {
      const savedData = localStorage.getItem('netWorthData');
      if (!savedData) return { totalAssets: 0, totalLiabilities: 0 };
      const data = JSON.parse(savedData);
      const totalAssets = (data.homeValue || 0) + (data.otherRealEstate || 0) + (data.jewellery || 0) + 
                            (data.sovereignGoldBonds || 0) + (data.ulipsSurrenderValue || 0) + (data.epfPpfVpf || 0) +
                            (data.fixedDeposits || 0) + (data.debtFunds || 0) + (data.domesticStocks || 0) + 
                            (data.domesticMutualFunds || 0) + (data.internationalFunds || 0) + (data.smallCases || 0) + 
                            (data.savingsBalance || 0) + (data.preciousMetals || 0) + (data.cryptocurrency || 0) + (data.reits || 0);
      const totalLiabilities = (data.homeLoan || 0) + (data.educationLoan || 0) + (data.carLoan || 0) + 
                               (data.personalLoan || 0) + (data.creditCardDues || 0) + (data.otherLiabilities || 0);
      return { totalAssets, totalLiabilities };
    } catch {
      return { totalAssets: 0, totalLiabilities: 0 };
    }
};

const RetirementDashboard: React.FC = () => {
  const [retirementFund, setRetirementFund] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [retirementData, setRetirementData] = useState<RetirementState>(() => {
    const defaultState: RetirementState = {
      currentAge: 0,
      retirementAge: 0,
      lifeExpectancy: 0,
      currentAnnualExpenses: 0,
      inflation: 6,
      allocations: { equity: 50, fds: 25, bonds: 20, cash: 5 },
      returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
    };
    try {
      const savedData = localStorage.getItem("retirementData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return { ...defaultState, ...parsedData, allocations: { ...defaultState.allocations, ...(parsedData.allocations || {}) }, returns: { ...defaultState.returns, ...(parsedData.returns || {}) } };
      }
      return defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    try {
      const futureValueData = JSON.parse(localStorage.getItem("future-value-data") || "[]");
      const projectedCorpus = JSON.parse(localStorage.getItem("projectedAccumulatedCorpus") || "0");

      // Calculate Liquid Future Value
      const totalFutureValue = futureValueData.reduce((sum: number, asset: any) => sum + (asset.futureValue || 0), 0);
      const illiquidAssetNames = ["Home Value", "Other Real Estate", "Jewellery"];
      const illiquidFutureValue = futureValueData
          .filter((asset: any) => illiquidAssetNames.includes(asset.name))
          .reduce((sum: number, asset: any) => sum + (asset.futureValue || 0), 0);
      const liquidFutureValue = totalFutureValue - illiquidFutureValue;

      // Update retirementFund calculation to include projected cash flow
      setRetirementFund(Math.max(0, liquidFutureValue + projectedCorpus));

      const { totalAssets, totalLiabilities } = getNetWorthData();
      setNetWorth(totalAssets - totalLiabilities);
    } catch (error) {
      console.error("Failed to parse data from localStorage:", error);
      setRetirementFund(0);
      setNetWorth(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("retirementData", JSON.stringify(retirementData));
  }, [retirementData]);

  const exportData = () => {
    const dataStr = JSON.stringify(retirementData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'retirement-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSuccess("Retirement data exported successfully!");
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as RetirementState;
        // Basic validation
        if (
          typeof importedData.currentAge === 'number' &&
          typeof importedData.retirementAge === 'number' &&
          importedData.allocations && typeof importedData.allocations.equity === 'number'
        ) {
          setRetirementData(importedData);
          showSuccess('Retirement data imported successfully!');
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.removeItem('retirementData');
    showSuccess("Retirement data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleStateChange = (field: keyof RetirementState, value: any) => {
    setRetirementData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAllocationChange = (category: keyof RetirementState["allocations"], value: number) => {
    handleStateChange("allocations", { ...retirementData.allocations, [category]: value });
  };

  const handleReturnChange = (category: keyof RetirementState["returns"], value: string) => {
    handleStateChange("returns", { ...retirementData.returns, [category]: Number(value) });
  };

  const totalAllocation = useMemo(() => Object.values(retirementData.allocations).reduce((sum, val) => sum + val, 0), [retirementData.allocations]);
  const yearsToRetirement = useMemo(() => Math.max(0, retirementData.retirementAge - retirementData.currentAge), [retirementData.retirementAge, retirementData.currentAge]);
  const futureAnnualExpenses = useMemo(() => yearsToRetirement <= 0 ? retirementData.currentAnnualExpenses : retirementData.currentAnnualExpenses * Math.pow(1 + retirementData.inflation / 100, yearsToRetirement), [yearsToRetirement, retirementData.currentAnnualExpenses, retirementData.inflation]);
  
  const weightedAvgReturn = useMemo(() => Object.keys(retirementData.allocations).reduce((acc, key) => acc + (retirementData.allocations[key as keyof typeof retirementData.allocations] / 100) * retirementData.returns[key as keyof typeof retirementData.returns], 0), [retirementData.allocations, retirementData.returns]);
  
  const annualReturnsAfterRetirement = useMemo(() => {
    if (retirementFund <= 0) return 0;
    const { allocations, returns } = retirementData;
    const nonEquityFund = retirementFund * ((allocations.fds + allocations.bonds + allocations.cash) / 100);
    const nonEquityReturns = (allocations.fds * returns.fds) + (allocations.bonds * returns.bonds) + (allocations.cash * returns.cash);
    const nonEquityAllocation = allocations.fds + allocations.bonds + allocations.cash;
    if (nonEquityAllocation === 0) return 0;
    const weightedNonEquityReturn = nonEquityReturns / nonEquityAllocation;
    return nonEquityFund * (weightedNonEquityReturn / 100);
  }, [retirementFund, retirementData.allocations, retirementData.returns]);

  const corpusSustainability = useMemo(() => {
    if (retirementFund <= 0 || futureAnnualExpenses <= 0 || totalAllocation !== 100) return 0;
    let currentFund = retirementFund, currentWithdrawal = futureAnnualExpenses, years = 0;
    const maxYears = retirementData.lifeExpectancy - retirementData.retirementAge;
    while (currentFund > 0 && years < maxYears) {
      currentFund -= currentWithdrawal;
      if (currentFund <= 0) break;
      currentFund *= (1 + weightedAvgReturn / 100);
      currentWithdrawal *= (1 + retirementData.inflation / 100);
      years++;
    }
    return years;
  }, [retirementFund, futureAnnualExpenses, weightedAvgReturn, retirementData.inflation, totalAllocation, retirementData.lifeExpectancy, retirementData.retirementAge]);

  const FIRE_MULTIPLIER = 25;
  const leanFireCorpus = useMemo(() => (futureAnnualExpenses * 0.8) * FIRE_MULTIPLIER, [futureAnnualExpenses]);
  const fatFireCorpus = useMemo(() => (futureAnnualExpenses * 1.5) * FIRE_MULTIPLIER, [futureAnnualExpenses]);
  const coastFireNumber = useMemo(() => yearsToRetirement <= 0 ? leanFireCorpus : (futureAnnualExpenses * FIRE_MULTIPLIER) / Math.pow(1 + weightedAvgReturn / 100, yearsToRetirement), [futureAnnualExpenses, yearsToRetirement, weightedAvgReturn, leanFireCorpus]);

  const projectedCorpusFromExistingAssets = useMemo(() => netWorth <= 0 || yearsToRetirement <= 0 ? 0 : netWorth * Math.pow(1 + weightedAvgReturn / 100, yearsToRetirement), [netWorth, yearsToRetirement, weightedAvgReturn]);
  const retirementShortfall = useMemo(() => Math.max(0, leanFireCorpus - projectedCorpusFromExistingAssets), [leanFireCorpus, projectedCorpusFromExistingAssets]);
  
  const requiredMonthlySIP = useMemo(() => {
    if (retirementShortfall <= 0 || yearsToRetirement <= 0) return 0;
    const monthlyRate = (weightedAvgReturn / 100) / 12;
    const numberOfMonths = yearsToRetirement * 12;
    if (monthlyRate === 0) return retirementShortfall / numberOfMonths;
    return retirementShortfall * (monthlyRate / (Math.pow(1 + monthlyRate, numberOfMonths) - 1));
  }, [retirementShortfall, yearsToRetirement, weightedAvgReturn]);

  const returnOptions = Array.from({ length: 14 }, (_, i) => i + 5);
  const cashReturnOptions = [0, 0.5, 1, 1.5, 2, 2.5];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Retirement Dashboard</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all retirement data on this page to its default state. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Yes, clear data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file">
              <Download className="mr-2 h-4 w-4" /> Import
              <Input 
                id="import-file" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={importData}
              />
            </Label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Retirement Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="currentAge">Current Age</Label><Input id="currentAge" type="number" value={retirementData.currentAge} onChange={(e) => handleStateChange("currentAge", Number(e.target.value))} /></div>
              <div><Label htmlFor="retirementAge">Retirement Age</Label><Input id="retirementAge" type="number" value={retirementData.retirementAge} onChange={(e) => handleStateChange("retirementAge", Number(e.target.value))} /></div>
              <div><Label htmlFor="lifeExpectancy">Life Expectancy</Label><Input id="lifeExpectancy" type="number" value={retirementData.lifeExpectancy} onChange={(e) => handleStateChange("lifeExpectancy", Number(e.target.value))} /></div>
            </div>
            <div><Label htmlFor="currentAnnualExpenses">Current Annual Expenses (₹)</Label><Input id="currentAnnualExpenses" type="number" value={retirementData.currentAnnualExpenses} onChange={(e) => handleStateChange("currentAnnualExpenses", Number(e.target.value))} /></div>
            <div><Label>Expected Inflation</Label><Slider value={[retirementData.inflation]} onValueChange={(val) => handleStateChange("inflation", val[0])} min={5} max={10} step={0.5} /><div className="text-center font-medium">{retirementData.inflation.toFixed(1)}%</div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Retirement Projections</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Liquid Future Value + Projected Cash Flow</Label><div className="text-3xl font-bold text-green-600">₹{retirementFund.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div></div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Future Annual Expenses:</span><span className="font-bold">₹{futureAnnualExpenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Corpus will last for:</span><span className="font-bold text-blue-600">{corpusSustainability >= (retirementData.lifeExpectancy - retirementData.retirementAge) ? `${retirementData.lifeExpectancy - retirementData.retirementAge}+ Years` : `${corpusSustainability.toFixed(0)} Years`}</span></div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Annual Returns (Non-Equity):</span><span className="font-bold">₹{annualReturnsAfterRetirement.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
              {annualReturnsAfterRetirement > 0 && (
                <div className="text-center pt-2 flex items-center justify-center gap-2">
                  {annualReturnsAfterRetirement > futureAnnualExpenses ? (
                    <p className="text-green-600 font-semibold">Returns Generated is in excess</p>
                  ) : (
                    <p className="text-red-500 font-semibold">Reduce the expenses</p>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        This message appears if your projected annual returns from non-equity assets (FDs, Bonds, Cash) are less than your future annual expenses at retirement. It suggests your safer investments alone may not cover your living costs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Retirement Savings Goal</CardTitle><p className="text-sm text-muted-foreground">Calculates the monthly savings needed to reach your Lean FIRE goal.</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between"><span className="text-muted-foreground">Target Corpus (Lean FIRE):</span><span className="font-bold">₹{leanFireCorpus.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Projected Corpus (from existing assets):</span><span className="font-bold">₹{projectedCorpusFromExistingAssets.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="font-bold">Retirement Shortfall:</span><span className={`font-bold ${retirementShortfall > 0 ? 'text-orange-500' : 'text-green-600'}`}>₹{retirementShortfall.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></div>
          <div className="text-center bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg"><p className="text-lg font-semibold text-blue-800 dark:text-blue-300">Required Monthly SIP</p><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{requiredMonthlySIP.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>FIRE Goals</CardTitle><p className="text-sm text-muted-foreground">Calculations based on the 4% withdrawal rule (25x annual expenses).</p></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Lean FIRE</CardTitle><Flame className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{leanFireCorpus.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div><p className="text-xs text-muted-foreground">For a minimalist lifestyle (80% of expenses).</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Coast FIRE</CardTitle><Sailboat className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{coastFireNumber.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div><p className="text-xs text-muted-foreground">Amount needed today to grow to FIRE by retirement.</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Fat FIRE</CardTitle><Gem className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{fatFireCorpus.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div><p className="text-xs text-muted-foreground">For a luxurious lifestyle (150% of expenses).</p></CardContent></Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Investment Allocation</CardTitle><p className={`text-sm ${totalAllocation !== 100 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>Total Allocation: {totalAllocation}% {totalAllocation !== 100 && "(Must be 100%)"}</p></CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div><AllocationPieChart data={retirementData.allocations} /></div>
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.keys(retirementData.allocations).map((key) => {
              const category = key as keyof RetirementState["allocations"];
              const options = category === 'cash' ? cashReturnOptions : returnOptions;
              return (
                <div key={category} className="space-y-3">
                  <Label className="capitalize text-lg">{category}</Label>
                  <Slider value={[retirementData.allocations[category]]} onValueChange={(val) => handleAllocationChange(category, val[0])} min={0} max={100} step={1} />
                  <div className="text-center font-medium">{retirementData.allocations[category]}%</div>
                  <div className="text-center text-sm text-muted-foreground">₹{(retirementFund * (retirementData.allocations[category] / 100)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                  <div><Label className="text-xs">Expected Return</Label><Select value={String(retirementData.returns[category])} onValueChange={(val) => handleReturnChange(category, val)}><SelectTrigger><SelectValue placeholder="Select return" /></SelectTrigger><SelectContent>{options.map(rate => (<SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>))}</SelectContent></Select></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetirementDashboard;