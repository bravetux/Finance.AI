"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

// Calculation helpers
const calculateTargetFutureValue = (currentValue: number, inflation: number, duration: number): number => {
  if (currentValue <= 0 || duration <= 0) return 0;
  return currentValue * Math.pow(1 + inflation / 100, duration);
};

const calculateSIPRequired = (targetFutureValue: number, rateOfGrowth: number, duration: number): number => {
  if (targetFutureValue <= 0 || duration <= 0) return 0;
  const monthlyRate = (rateOfGrowth / 100) / 12;
  const numberOfMonths = duration * 12;
  if (monthlyRate === 0) return targetFutureValue / numberOfMonths;
  return targetFutureValue * (monthlyRate / (Math.pow(1 + monthlyRate, numberOfMonths) - 1));
};

const GoalCalculator: React.FC = () => {
  const [goalCost, setGoalCost] = useState(1000000);
  const [amountAchieved, setAmountAchieved] = useState(0);
  const [inflation, setInflation] = useState(10);
  const [duration, setDuration] = useState(6);
  const [rateOfGrowth, setRateOfGrowth] = useState(10);
  const [currentAge, setCurrentAge] = useState(44); // Default, will be updated from localStorage

  useEffect(() => {
    try {
      const savedRetirementData = localStorage.getItem('retirementData');
      if (savedRetirementData) {
        const retirementData = JSON.parse(savedRetirementData);
        setCurrentAge(retirementData.currentAge || 44);
      }
    } catch (e) {
      console.error("Failed to load retirement data from localStorage:", e);
    }
  }, []);

  const { ageAtGoal, targetFutureValue, monthlySipRequired } = useMemo(() => {
    const ageAtGoal = currentAge + duration;
    const remainingGoalCost = Math.max(0, goalCost - amountAchieved);
    const targetFutureValue = calculateTargetFutureValue(remainingGoalCost, inflation, duration);
    const monthlySipRequired = calculateSIPRequired(targetFutureValue, rateOfGrowth, duration);
    return { ageAtGoal, targetFutureValue, monthlySipRequired };
  }, [goalCost, amountAchieved, inflation, duration, rateOfGrowth, currentAge]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const numericValue = Number(value.replace(/,/g, ''));
    if (!isNaN(numericValue)) {
      setter(numericValue);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        Goal Calculator
      </h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Plan for Your Financial Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goalCost">Goal Cost (Today's ₹)</Label>
            <Input
              id="goalCost"
              type="text"
              value={goalCost.toLocaleString('en-IN')}
              onChange={(e) => handleInputChange(setGoalCost, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountAchieved">Amount Achieved (₹)</Label>
            <Input
              id="amountAchieved"
              type="text"
              placeholder="e.g., 50,000"
              value={amountAchieved > 0 ? amountAchieved.toLocaleString('en-IN') : ''}
              onChange={(e) => handleInputChange(setAmountAchieved, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inflation">Inflation (%)</Label>
            <Input
              id="inflation"
              type="number"
              value={inflation}
              onChange={(e) => handleInputChange(setInflation, e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Years)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => handleInputChange(setDuration, e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageAtGoal">Age at Goal</Label>
              <Input
                id="ageAtGoal"
                type="number"
                value={ageAtGoal}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateOfGrowth">Rate of Growth (%)</Label>
            <Input
              id="rateOfGrowth"
              type="number"
              value={rateOfGrowth}
              onChange={(e) => handleInputChange(setRateOfGrowth, e.target.value)}
            />
          </div>
          <div className="border-t pt-6 mt-4 space-y-4 text-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Future Value:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(targetFutureValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly SIP Required:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(monthlySipRequired)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalCalculator;