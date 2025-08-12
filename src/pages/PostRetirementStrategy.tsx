"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AllocationPieChart from "@/components/AllocationPieChart";
import { LineChart, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface PostRetirementSettings {
  lifeExpectancy: number;
  inflation: number;
  allocations: { equity: number; fds: number; bonds: number; cash: number; };
  returns: { equity: number; fds: number; bonds: number; cash: number; };
}

const PostRetirementStrategy: React.FC = () => {
  const [initialCorpus, setInitialCorpus] = useState(0);
  const [initialAnnualExpenses, setInitialAnnualExpenses] = useState(0);
  const [currentAge, setCurrentAge] = useState(0);

  const [settings, setSettings] = useState<PostRetirementSettings>(() => {
    const defaultState: PostRetirementSettings = {
      lifeExpectancy: 85,
      inflation: 6,
      allocations: { equity: 30, fds: 40, bonds: 25, cash: 5 },
      returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
    };
    try {
      const saved = localStorage.getItem('postRetirementStrategyPageSettings');
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const canRetireData = JSON.parse(localStorage.getItem('canRetireNowData') || '{}');
        setInitialCorpus(canRetireData.corpus || 0);
        setInitialAnnualExpenses(canRetireData.annualExpenses || 0);
        setCurrentAge(canRetireData.currentAge || 0);
      } catch (e) {
        console.error("Failed to load data for post-retirement strategy", e);
      }
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    localStorage.setItem('postRetirementStrategyPageSettings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingsChange = (field: keyof PostRetirementSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  const handleAllocationChange = (category: keyof PostRetirementSettings["allocations"], value: number) => {
    handleSettingsChange("allocations", { ...settings.allocations, [category]: value });
  };
  const handleReturnChange = (category: keyof PostRetirementSettings["returns"], value: number) => {
    handleSettingsChange("returns", { ...settings.returns, [category]: Number(value) });
  };

  const totalAllocation = useMemo(() => Object.values(settings.allocations).reduce((sum, val) => sum + val, 0), [settings.allocations]);
  
  const weightedAvgReturn = useMemo(() => {
    if (totalAllocation !== 100) return 0;
    return Object.keys(settings.allocations).reduce((acc, key) => 
      acc + (settings.allocations[key as keyof typeof settings.allocations] / 100) * settings.returns[key as keyof typeof settings.returns], 0
    );
  }, [settings.allocations, settings.returns, totalAllocation]);

  const simulation = useMemo(() => {
    if (initialCorpus <= 0 || initialAnnualExpenses <= 0 || totalAllocation !== 100) {
      return { projections: [], yearsLasted: 0, finalCorpus: initialCorpus };
    }

    const projections = [];
    let corpus = initialCorpus;
    let withdrawal = initialAnnualExpenses;
    const maxYears = settings.lifeExpectancy - currentAge;

    for (let year = 1; year <= maxYears; year++) {
      const age = currentAge + year;
      const openingBalance = corpus;
      
      corpus -= withdrawal;
      if (corpus <= 0) {
        projections.push({ year, age, openingBalance, withdrawal, earnings: 0, closingBalance: 0 });
        break;
      }
      
      const earnings = corpus * (weightedAvgReturn / 100);
      corpus += earnings;
      
      projections.push({ year, age, openingBalance, withdrawal, earnings, closingBalance: corpus });
      
      withdrawal *= (1 + settings.inflation / 100);
    }

    return { projections, yearsLasted: projections.length, finalCorpus: corpus };
  }, [initialCorpus, initialAnnualExpenses, currentAge, settings, weightedAvgReturn, totalAllocation]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Post-Retirement Withdrawal Strategy</h1>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Starting Corpus</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(initialCorpus)}</div><p className="text-xs text-muted-foreground">From 'Can You Retire Now?' page</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Corpus Lasts Until Age</CardTitle><LineChart className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{currentAge + simulation.yearsLasted}</div><p className="text-xs text-muted-foreground">Your money is projected to last {simulation.yearsLasted} years.</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Final Balance</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${simulation.finalCorpus > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(simulation.finalCorpus)}</div><p className="text-xs text-muted-foreground">Projected balance at age {settings.lifeExpectancy}.</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Investment Strategy & Inputs</CardTitle>
            <CardDescription>Define how your corpus will be allocated and the expected returns for each asset class.</CardDescription>
            <p className={`text-sm pt-2 ${totalAllocation !== 100 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>Total Allocation: {totalAllocation}% {totalAllocation !== 100 && "(Must be 100%)"}</p>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <AllocationPieChart data={settings.allocations} />
            </div>
            <div className="space-y-6">
              {Object.keys(settings.allocations).map((key) => {
                const category = key as keyof PostRetirementSettings["allocations"];
                const allocatedValue = initialCorpus * (settings.allocations[category] / 100);
                return (
                  <div key={category} className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="capitalize text-md">{category}</Label>
                      <Slider value={[settings.allocations[category]]} onValueChange={(val) => handleAllocationChange(category, val[0])} min={0} max={100} step={5} />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{settings.allocations[category]}%</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(allocatedValue)}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`return-${category}`} className="text-xs">Return (%)</Label>
                      <Input id={`return-${category}`} type="number" value={settings.returns[category]} onChange={(e) => handleReturnChange(category, Number(e.target.value))} />
                    </div>
                  </div>
                );
              })}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Year-by-Year Withdrawal Projection</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Withdrawal</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulation.projections.map((p) => (
                  <TableRow key={p.year}>
                    <TableCell>{p.year}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.openingBalance)}</TableCell>
                    <TableCell className="text-right text-red-500">({formatCurrency(p.withdrawal)})</TableCell>
                    <TableCell className="text-right text-green-500">{formatCurrency(p.earnings)}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(p.closingBalance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRetirementStrategy;