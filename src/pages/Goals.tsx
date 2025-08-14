"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
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

interface Goal {
  id: string;
  name: string;
  currentValue: number; // Represents Goal Cost in Today's Value
  inflation: number;
  duration: number; // in years
  rateOfGrowth: number; // annual percentage for investments
  amountAchieved: number; // Amount achieved so far
  targetFutureValue: number; // calculated future cost of goal
  sipRequired: number; // calculated monthly SIP
}

// Calculates the future cost of a goal based on its current cost and inflation.
const calculateTargetFutureValue = (currentValue: number, inflation: number, duration: number): number => {
  return currentValue * Math.pow(1 + inflation / 100, duration);
};

// Calculates the required monthly SIP to reach a target future value.
// The presentValue (amount achieved) is now handled before calling this function.
const calculateSIPRequired = (
  targetFutureValue: number,
  rateOfGrowth: number,
  duration: number
): number => {
  if (targetFutureValue <= 0 || duration <= 0) {
    return 0;
  }

  const monthlyRate = (rateOfGrowth / 100) / 12;
  const numberOfMonths = duration * 12;

  if (monthlyRate === 0) {
    return targetFutureValue / numberOfMonths;
  }

  // Standard formula for monthly SIP (ordinary annuity)
  const sip = targetFutureValue * (monthlyRate / (Math.pow(1 + monthlyRate, numberOfMonths) - 1));
  return sip;
};

const Goals: React.FC = () => {
  const [currentAge, setCurrentAge] = React.useState<number>(0);

  React.useEffect(() => {
    try {
      const savedRetirementData = localStorage.getItem('retirementData');
      if (savedRetirementData) {
        const retirementData = JSON.parse(savedRetirementData);
        setCurrentAge(retirementData.currentAge || 0);
      }
    } catch (e) {
      console.error("Failed to load retirement data from localStorage:", e);
    }
  }, []);

  const [goals, setGoals] = React.useState<Goal[]>(() => {
    const initialGoals: Goal[] = Array.from({ length: 10 }, (_, i) => ({
      id: `goal-${i + 1}`,
      name: `Goal ${i + 1}`,
      currentValue: 0,
      inflation: 5,
      duration: 10,
      rateOfGrowth: 10,
      amountAchieved: 0,
      targetFutureValue: 0,
      sipRequired: 0,
    }));

    let goalsToProcess = initialGoals;

    try {
      const savedGoals = localStorage.getItem('goalsData');
      if (savedGoals) {
        const importedData = JSON.parse(savedGoals) as Partial<Goal>[];
        goalsToProcess = initialGoals.map((defaultGoal, index) => ({
            ...defaultGoal,
            ...(importedData[index] || {})
        }));
      }
    } catch (e) {
      console.error("Failed to load goals data from localStorage:", e);
    }

    // Recalculate all goals on initial load to ensure data is fresh
    return goalsToProcess.map(goal => {
      const remainingCurrentValue = Math.max(0, goal.currentValue - goal.amountAchieved);
      const targetFV = calculateTargetFutureValue(remainingCurrentValue, goal.inflation, goal.duration);
      const sip = calculateSIPRequired(targetFV, goal.rateOfGrowth, goal.duration);
      return { ...goal, targetFutureValue: targetFV, sipRequired: sip };
    });
  });

  // Persist to localStorage whenever goals change
  React.useEffect(() => {
    localStorage.setItem('goalsData', JSON.stringify(goals));
  }, [goals]);

  const handleInputChange = (index: number, field: keyof Goal, value: string) => {
    const newGoals = [...goals];
    const updatedGoal = { ...newGoals[index] };

    if (field === 'name') {
      updatedGoal.name = value;
    } else {
      (updatedGoal[field] as number) = Number(value) || 0;
    }
    
    // Recalculate derived values for this goal
    const remainingCurrentValue = Math.max(0, updatedGoal.currentValue - updatedGoal.amountAchieved);
    const targetFV = calculateTargetFutureValue(remainingCurrentValue, updatedGoal.inflation, updatedGoal.duration);
    const sip = calculateSIPRequired(targetFV, updatedGoal.rateOfGrowth, updatedGoal.duration);
    
    updatedGoal.targetFutureValue = targetFV;
    updatedGoal.sipRequired = sip;

    newGoals[index] = updatedGoal;
    setGoals(newGoals);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(goals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'goals-data.json';

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
        const importedData = JSON.parse(content) as Goal[];
        const processedData = importedData.map(goal => {
          const remainingCurrentValue = Math.max(0, (Number(goal.currentValue) || 0) - (Number(goal.amountAchieved) || 0));
          const targetFV = calculateTargetFutureValue(remainingCurrentValue, Number(goal.inflation) || 0, Number(goal.duration) || 0);
          const sip = calculateSIPRequired(targetFV, Number(goal.rateOfGrowth) || 0, Number(goal.duration) || 0);
          return {
            id: goal.id || `goal-${Math.random().toString(36).substr(2, 9)}`,
            name: goal.name || 'Imported Goal',
            currentValue: Number(goal.currentValue) || 0,
            inflation: Number(goal.inflation) || 0,
            duration: Number(goal.duration) || 0,
            rateOfGrowth: Number(goal.rateOfGrowth) || 0,
            amountAchieved: Number(goal.amountAchieved) || 0,
            targetFutureValue: targetFV,
            sipRequired: sip,
          };
        });
        setGoals(processedData);
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.removeItem('goalsData');
    showSuccess("Goals data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const totalTargetFutureValue = goals.reduce((sum, goal) => sum + goal.targetFutureValue, 0);
  const totalSipRequired = goals.reduce((sum, goal) => sum + goal.sipRequired, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals</h1>
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
                  This will reset all goals on this page to their default state. This action cannot be undone.
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

      <Card>
        <CardHeader>
          <CardTitle>Goals Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Target Future Value:</span>
            <span className="font-bold text-lg text-green-600">
              ₹{totalTargetFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Monthly SIP Required:</span>
            <span className="font-bold text-lg text-blue-600">
              ₹{totalSipRequired.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal, index) => {
          const ageAtGoal = currentAge + goal.duration;
          return (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Input
                    type="text"
                    value={goal.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    className="text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`currentValue-${index}`}>Goal Cost (Today's ₹)</Label>
                  <Input
                    id={`currentValue-${index}`}
                    type="number"
                    value={goal.currentValue}
                    onChange={(e) => handleInputChange(index, 'currentValue', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`amountAchieved-${index}`}>Amount Achieved (₹)</Label>
                  <Input
                    id={`amountAchieved-${index}`}
                    type="number"
                    value={goal.amountAchieved}
                    onChange={(e) => handleInputChange(index, 'amountAchieved', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`inflation-${index}`}>Inflation (%)</Label>
                  <Input
                    id={`inflation-${index}`}
                    type="number"
                    value={goal.inflation}
                    onChange={(e) => handleInputChange(index, 'inflation', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`duration-${index}`}>Duration (Years)</Label>
                    <Input
                      id={`duration-${index}`}
                      type="number"
                      value={goal.duration}
                      onChange={(e) => handleInputChange(index, 'duration', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`ageAtGoal-${index}`}>Age at Goal</Label>
                    <Input
                      id={`ageAtGoal-${index}`}
                      type="number"
                      value={ageAtGoal}
                      readOnly
                      className="mt-1 bg-muted"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`rateOfGrowth-${index}`}>Rate of Growth (%)</Label>
                  <Input
                    id={`rateOfGrowth-${index}`}
                    type="number"
                    value={goal.rateOfGrowth}
                    onChange={(e) => handleInputChange(index, 'rateOfGrowth', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Target Future Value:</span>
                    <span className="font-bold text-green-600">
                      ₹{goal.targetFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly SIP Required:</span>
                    <span className="font-bold text-blue-600">
                      ₹{goal.sipRequired.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;