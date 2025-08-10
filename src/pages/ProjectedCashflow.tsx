"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showError } from "@/utils/toast";

// Function to get initial financial data from localStorage
const getInitialFinanceData = () => {
  try {
    const savedData = localStorage.getItem('finance-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      
      const rentalIncome = (data.rentalProperty1 || 0) + (data.rentalProperty2 || 0) + (data.rentalProperty3 || 0);
      
      // All other income sources that are not salary or rental
      const otherIncome = (data.businessIncome || 0) + (data.fdInterest || 0) + (data.bondIncome || 0) + (data.dividendIncome || 0);

      // Expenses that are subject to the 'expenseIncrement' slider
      const variableAnnualExpenses = ((data.monthlyHouseholdExpense || 0) + (data.monthlyEntertainment || 0) + (data.monthlyTravel || 0) + (data.monthlyOthers || 0) + (data.monthlyDonation || 0)) * 12;

      // Outflows that are likely fixed and not subject to general expense inflation
      const fixedAnnualOutflows = ((data.monthlyPpf || 0) + (data.monthlyUlip || 0) + (data.monthlyInsurance || 0) + (data.monthlyRds || 0) + (data.monthlyLoanEMIs || 0)) * 12;

      return {
        postTaxSalaryIncome: data.postTaxSalaryIncome || 0,
        rentalIncome: rentalIncome,
        otherIncome: otherIncome,
        variableAnnualExpenses: variableAnnualExpenses,
        fixedAnnualOutflows: fixedAnnualOutflows,
      };
    }
  } catch (error) {
    console.error("Failed to load finance data from localStorage:", error);
  }
  // Default values if localStorage is empty or fails
  return {
    postTaxSalaryIncome: 1200000,
    rentalIncome: 390000,
    otherIncome: 580000,
    variableAnnualExpenses: 550000,
    fixedAnnualOutflows: 250000,
  };
};


interface ProjectionSettings {
  currentAge: number;
  retirementAge: number;
  surplusIncrement: number;
  expenseIncrement: number;
  equityAllocationPre55: number;
  equityReturns: number;
  fdReturns: number;
}

const ProjectedCashflow: React.FC = () => {
  const [settings, setSettings] = useState<ProjectionSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('projectedCashflowSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Migration for old data
        if (parsed.salaryIncrement) {
          parsed.surplusIncrement = parsed.salaryIncrement;
          delete parsed.salaryIncrement;
        }
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
    }
    return {
      currentAge: 30,
      retirementAge: 60,
      surplusIncrement: 3,
      expenseIncrement: 10,
      equityAllocationPre55: 50,
      equityReturns: 12,
      fdReturns: 7,
    };
  });

  const [initialData, setInitialData] = useState(getInitialFinanceData());

  useEffect(() => {
    setInitialData(getInitialFinanceData());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('projectedCashflowSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [settings]);

  const { projections, finalAccumulatedCorpus, finalAnnualExpense } = useMemo(() => {
    const results = [];
    // Initialize with values from state
    let currentSalary = initialData.postTaxSalaryIncome;
    let currentRental = initialData.rentalIncome;
    const otherIncome = initialData.otherIncome; // Assuming this is constant
    let currentVariableExpenses = initialData.variableAnnualExpenses;
    const fixedOutflows = initialData.fixedAnnualOutflows; // Assuming this is constant
    
    let equityCorpus = 0;
    let fdCorpus = 0;

    const duration = settings.retirementAge - settings.currentAge;
    if (duration < 0) {
        return { projections: [], finalAccumulatedCorpus: 0, finalAnnualExpense: currentVariableExpenses + fixedOutflows };
    }

    for (let i = 0; i <= duration; i++) {
      const age = settings.currentAge + i;

      // Apply increments AFTER the first year's calculation (i.e., starting from year 2)
      if (i > 0) {
        currentSalary *= (1 + settings.surplusIncrement / 100);
        currentRental *= (1 + 0.05); // 5% rental increment
        currentVariableExpenses *= (1 + settings.expenseIncrement / 100);
      }

      // At the start of age 56, move all equity to FD
      if (age === 56) {
        fdCorpus += equityCorpus;
        equityCorpus = 0;
      }

      // Calculate savings for the current year
      const totalIncome = currentSalary + currentRental + otherIncome;
      const totalOutflows = currentVariableExpenses + fixedOutflows;
      const annualSavings = totalIncome - totalOutflows;

      // Add new savings to the corpus at the BEGINNING of the period
      const equityAllocation = age <= 55 ? settings.equityAllocationPre55 : 0;
      const newEquitySavings = annualSavings * (equityAllocation / 100);
      const newFdSavings = annualSavings * ((100 - equityAllocation) / 100);
      
      const equityCorpusBeforeGrowth = equityCorpus + newEquitySavings;
      const fdCorpusBeforeGrowth = fdCorpus + newFdSavings;

      // Calculate growth for the year based on the corpus that INCLUDES the new savings
      const equityGrowth = equityCorpusBeforeGrowth * (settings.equityReturns / 100);
      const fdGrowth = fdCorpusBeforeGrowth * (settings.fdReturns / 100);

      // Apply growth to the corpuses to get the final end-of-year value
      equityCorpus = equityCorpusBeforeGrowth + equityGrowth;
      fdCorpus = fdCorpusBeforeGrowth + fdGrowth;

      const accumulatedCorpus = equityCorpus + fdCorpus;

      results.push({
        year: i + 1,
        age,
        savings: annualSavings,
        equityGrowth,
        fdGrowth,
        accumulatedCorpus,
      });
    }
    
    const finalCorpus = results.length > 0 ? results[results.length - 1].accumulatedCorpus : 0;
    const finalExpense = currentVariableExpenses + fixedOutflows;

    return { projections: results, finalAccumulatedCorpus: finalCorpus, finalAnnualExpense: finalExpense };
  }, [settings, initialData]);

  useEffect(() => {
    try {
      localStorage.setItem('projectedAccumulatedCorpus', JSON.stringify(finalAccumulatedCorpus));
    } catch (error) {
      console.error("Failed to save projected corpus to localStorage:", error);
    }
  }, [finalAccumulatedCorpus]);

  const exportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'projected-cashflow-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content);
        const requiredKeys: (keyof ProjectionSettings)[] = ['currentAge', 'retirementAge', 'surplusIncrement', 'expenseIncrement', 'equityAllocationPre55', 'equityReturns', 'fdReturns'];
        const hasAllKeys = requiredKeys.every(key => key in importedSettings);
        if (hasAllKeys) {
          setSettings(importedSettings);
        } else {
          showError('Invalid file format. Some settings are missing.');
        }
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
        console.error('Error parsing file:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projected Cash Flow</h1>
        <div className="flex gap-2">
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
          <CardHeader>
            <CardTitle>Projected Corpus at Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              ₹{finalAccumulatedCorpus.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              This is the estimated value of your savings at age {settings.retirementAge}.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projected Annual Expense at Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">
              ₹{finalAnnualExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              This is your estimated annual expense in the first year of retirement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projection Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="currentAge">Current Age</Label>
            <Input
              id="currentAge"
              type="number"
              value={settings.currentAge}
              onChange={(e) => setSettings(prev => ({ ...prev, currentAge: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="retirementAge">Retirement Age</Label>
            <Input
              id="retirementAge"
              type="number"
              value={settings.retirementAge}
              onChange={(e) => setSettings(prev => ({ ...prev, retirementAge: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Surplus Increment (%)</Label>
            <Slider
              value={[settings.surplusIncrement]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, surplusIncrement: val[0] }))}
              min={0}
              max={5}
              step={0.5}
            />
            <div className="text-center font-medium">{settings.surplusIncrement.toFixed(1)}%</div>
          </div>
          <div>
            <Label>Expense Increment (%)</Label>
            <Slider
              value={[settings.expenseIncrement]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, expenseIncrement: val[0] }))}
              min={1}
              max={10}
              step={0.5}
            />
            <div className="text-center font-medium">{settings.expenseIncrement.toFixed(1)}%</div>
          </div>
          <div>
            <Label>Equity Returns (%)</Label>
            <Slider
              value={[settings.equityReturns]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, equityReturns: val[0] }))}
              min={0}
              max={18}
              step={0.5}
            />
            <div className="text-center font-medium">{settings.equityReturns.toFixed(1)}%</div>
          </div>
          <div>
            <Label>FD/Debt Returns (%)</Label>
            <Slider
              value={[settings.fdReturns]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, fdReturns: val[0] }))}
              min={5}
              max={12}
              step={0.5}
            />
            <div className="text-center font-medium">{settings.fdReturns.toFixed(1)}%</div>
          </div>
          <div className="lg:col-span-3">
            <Label>Equity Allocation (Upto Age 55)</Label>
            <Slider
              value={[settings.equityAllocationPre55]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, equityAllocationPre55: val[0] }))}
              min={0}
              max={100}
              step={5}
            />
            <div className="flex justify-between text-sm font-medium mt-2">
              <span>Equity: {settings.equityAllocationPre55}%</span>
              <span>FDs/Debt: {100 - settings.equityAllocationPre55}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Annual Savings</TableHead>
                  <TableHead className="text-right">Equity Growth</TableHead>
                  <TableHead className="text-right">FD/Debt Growth</TableHead>
                  <TableHead className="text-right">Accumulated Corpus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projections.map((p) => (
                  <TableRow key={p.year}>
                    <TableCell>{p.year}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell className={`text-right font-bold ${p.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{p.savings.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      ₹{p.equityGrowth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right text-yellow-500">
                      ₹{p.fdGrowth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      ₹{p.accumulatedCorpus.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </TableCell>
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

export default ProjectedCashflow;