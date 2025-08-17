"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
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
  const [inflation, setInflation] = useState(6);
  const [duration, setDuration] = useState(10);
  const [rateOfGrowth, setRateOfGrowth] = useState(12);

  const { monthlySipRequired, investedAmount, totalInterest, targetFutureValue } = useMemo(() => {
    const remainingGoalCost = Math.max(0, goalCost - amountAchieved);
    const targetFV = calculateTargetFutureValue(remainingGoalCost, inflation, duration);
    const monthlySip = calculateSIPRequired(targetFV, rateOfGrowth, duration);
    const totalInvested = monthlySip * duration * 12;
    const interest = targetFV - totalInvested;

    return { 
      monthlySipRequired: monthlySip, 
      investedAmount: totalInvested, 
      totalInterest: interest > 0 ? interest : 0,
      targetFutureValue: targetFV 
    };
  }, [goalCost, amountAchieved, inflation, duration, rateOfGrowth]);

  const chartData = [
    { name: "Total investment", value: investedAmount },
    { name: "Total interest", value: totalInterest },
  ];

  const COLORS = ["#E0E7FF", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        Goal Calculator
      </h1>

      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Goal Cost (Today's Value)</label>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {formatCurrency(goalCost)}
                  </span>
                </div>
                <Slider value={[goalCost]} onValueChange={(val) => setGoalCost(val[0])} min={100000} max={10000000} step={100000} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Amount Already Saved</label>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {formatCurrency(amountAchieved)}
                  </span>
                </div>
                <Slider value={[amountAchieved]} onValueChange={(val) => setAmountAchieved(val[0])} min={0} max={goalCost} step={10000} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Inflation Rate (p.a)</label>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{inflation}%</span>
                </div>
                <Slider value={[inflation]} onValueChange={(val) => setInflation(val[0])} min={1} max={15} step={0.5} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Expected Return Rate (p.a)</label>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{rateOfGrowth}%</span>
                </div>
                <Slider value={[rateOfGrowth]} onValueChange={(val) => setRateOfGrowth(val[0])} min={1} max={30} step={0.5} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Time Period</label>
                  <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{duration} Yr</span>
                </div>
                <Slider value={[duration]} onValueChange={(val) => setDuration(val[0])} min={1} max={40} step={1} />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm mb-6 space-y-2 text-center">
                  <p className="text-muted-foreground">Monthly SIP required</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(monthlySipRequired)}</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full max-w-sm mt-6 space-y-2 text-lg">
                <div className="flex justify-between"><span className="text-muted-foreground">Total investment</span><span className="font-medium">{formatCurrency(investedAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total interest</span><span className="font-medium">{formatCurrency(totalInterest)}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Future Value of Goal</span><span className="font-bold text-xl">{formatCurrency(targetFutureValue)}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalCalculator;