"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Flame, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
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

const initialInputs = {
  monthlyExpenses: 0,
  currentAge: 0,
  retirementAge: 0,
  inflation: 6,
  coastFireAge: 0,
  expectedReturn: 12,
};

const FireCalculator: React.FC = () => {
  const [inputs, setInputs] = useState(() => {
    try {
      const saved = localStorage.getItem('fireCalculatorData');
      return saved ? JSON.parse(saved) : initialInputs;
    } catch {
      return initialInputs;
    }
  });

  useEffect(() => {
    const syncAges = () => {
      try {
        const retirementDataString = localStorage.getItem('retirementData');
        if (retirementDataString) {
          const retirementData = JSON.parse(retirementDataString);
          setInputs(prevInputs => ({
            ...prevInputs,
            currentAge: retirementData.currentAge || prevInputs.currentAge,
            retirementAge: retirementData.retirementAge || prevInputs.retirementAge,
          }));
        }
      } catch (error) {
        console.error("Failed to sync data from retirement page:", error);
      }
    };

    syncAges(); // Sync on initial load
    window.addEventListener('storage', syncAges); // Sync on storage change

    return () => {
      window.removeEventListener('storage', syncAges); // Cleanup listener
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('fireCalculatorData', JSON.stringify(inputs));
  }, [inputs]);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const calculations = useMemo(() => {
    const { monthlyExpenses, currentAge, retirementAge, inflation, coastFireAge, expectedReturn } = inputs;

    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    const yearlyExpensesToday = monthlyExpenses * 12;
    const yearlyExpensesAtRetirement = yearlyExpensesToday * Math.pow(1 + inflation / 100, yearsToRetirement);

    const leanFireTarget = yearlyExpensesAtRetirement * 15;
    const fireTarget = yearlyExpensesAtRetirement * 25;
    const fatFireTarget = yearlyExpensesAtRetirement * 50;

    const yearsFromCoastToRetirement = Math.max(0, retirementAge - coastFireAge);
    const coastFireTarget = fireTarget / Math.pow(1 + expectedReturn / 100, yearsFromCoastToRetirement);

    return {
      yearlyExpensesToday,
      yearlyExpensesAtRetirement,
      leanFireTarget,
      fireTarget,
      fatFireTarget,
      coastFireTarget,
    };
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(inputs, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      saveAs(blob, "fire-calculator-data.json");
      showSuccess("FIRE Calculator data exported successfully!");
    } catch (error) {
      showError("Failed to export data.");
      console.error("Export error:", error);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        const requiredKeys: (keyof typeof inputs)[] = ['monthlyExpenses', 'currentAge', 'retirementAge', 'inflation', 'coastFireAge', 'expectedReturn'];
        const hasAllKeys = requiredKeys.every(key => key in importedData && typeof importedData[key] === 'number');

        if (hasAllKeys) {
          setInputs(importedData);
          showSuccess("FIRE Calculator data imported successfully!");
        } else {
          throw new Error("Invalid or incomplete file format.");
        }
      } catch (error: any) {
        showError(`Error parsing file: ${error.message}`);
      }
    };
    reader.onerror = () => {
        showError("Failed to read the file.");
    }
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearFields = () => {
    setInputs(initialInputs);
    localStorage.removeItem('fireCalculatorData');
    showSuccess("FIRE Calculator fields have been reset.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flame className="h-8 w-8" />
          FIRE Calculator
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Fields
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all fields on this page to their default values.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearFields}>
                  Yes, clear fields
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer">
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

      <Card>
        <CardHeader>
          <CardTitle>Financial Independence, Retire Early (FIRE) Calculator</CardTitle>
          <CardDescription>
            Estimate the corpus you need to achieve financial independence based on your lifestyle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="monthlyExpenses">Desired Monthly Expenses (Today's Value)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={inputs.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inflation">Expected Annual Inflation (%)</Label>
              <Input
                id="inflation"
                type="number"
                value={inputs.inflation}
                onChange={(e) => handleInputChange('inflation', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={inputs.currentAge}
                disabled
              />
               <p className="text-xs text-muted-foreground pt-1">Auto-populated from Retirement page.</p>
            </div>
            <div>
              <Label htmlFor="retirementAge">Desired Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={inputs.retirementAge}
                disabled
              />
               <p className="text-xs text-muted-foreground pt-1">Auto-populated from Retirement page.</p>
            </div>
            <div>
              <Label htmlFor="coastFireAge">Desired Coast FIRE Age</Label>
              <Input
                id="coastFireAge"
                type="number"
                value={inputs.coastFireAge}
                onChange={(e) => handleInputChange('coastFireAge', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expectedReturn">Expected Rate of Return (%)</Label>
              <Input
                id="expectedReturn"
                type="number"
                value={inputs.expectedReturn}
                onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Yearly Expenses Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Yearly Expenses</h3>
            <div className="flex justify-between">
              <p>Yearly Expenses (Today's Value):</p>
              <p className="font-medium">{formatCurrency(calculations.yearlyExpensesToday)}</p>
            </div>
            <div className="flex justify-between">
              <p>Yearly Expenses (at Retirement Age):</p>
              <p className="font-medium">{formatCurrency(calculations.yearlyExpensesAtRetirement)}</p>
            </div>
          </div>

          <Separator />

          {/* FIRE Targets Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">FIRE Targets</h3>
            <div className="flex justify-between">
              <p>Lean FIRE Target (15x Yearly Expenses):</p>
              <p className="font-medium text-orange-500">{formatCurrency(calculations.leanFireTarget)}</p>
            </div>
            <div className="flex justify-between">
              <p>FIRE Target (25x Yearly Expenses):</p>
              <p className="font-medium text-green-500">{formatCurrency(calculations.fireTarget)}</p>
            </div>
            <div className="flex justify-between">
              <p>FAT FIRE Target (50x Yearly Expenses):</p>
              <p className="font-medium text-purple-500">{formatCurrency(calculations.fatFireTarget)}</p>
            </div>
            <div className="flex justify-between">
              <p>Coast FIRE Target (by age {inputs.coastFireAge}):</p>
              <p className="font-medium text-blue-500">{formatCurrency(calculations.coastFireTarget)}</p>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              <strong>Coast FIRE:</strong> This is the amount you need to have invested by your Coast FIRE age. If you don't add another penny, it should grow to your FIRE Target by your desired retirement age.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FireCalculator;