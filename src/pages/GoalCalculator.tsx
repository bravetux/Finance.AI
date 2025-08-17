"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

const GoalCalculator: React.FC = () => {
  const [targetAmount, setTargetAmount] = useState(1000000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const calculations = useMemo(() => {
    const P = targetAmount;
    const i = returnRate / 12 / 100;
    const n = timePeriod * 12;

    if (i === 0 || n === 0) {
      const monthlySip = n > 0 ? P / n : 0;
      const investedAmount = P;
      return { monthlySip, investedAmount, totalInterest: 0 };
    }

    const monthlySip = P * (i / (Math.pow(1 + i, n) - 1));
    const investedAmount = monthlySip * n;
    const totalInterest = P - investedAmount;

    return { monthlySip, investedAmount, totalInterest };
  }, [targetAmount, returnRate, timePeriod]);

  const chartData = [
    { name: "Total investment", value: calculations.investedAmount },
    { name: "Total interest", value: calculations.totalInterest },
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
        <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Target amount</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {formatCurrency(targetAmount)}
                </span>
              </div>
              <Slider value={[targetAmount]} onValueChange={(val) => setTargetAmount(val[0])} min={100000} max={50000000} step={100000} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Expected return rate (p.a)</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{returnRate}%</span>
              </div>
              <Slider value={[returnRate]} onValueChange={(val) => setReturnRate(val[0])} min={1} max={30} step={0.5} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Time period</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{timePeriod} Yr</span>
              </div>
              <Slider value={[timePeriod]} onValueChange={(val) => setTimePeriod(val[0])} min={1} max={40} step={1} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm mb-6 space-y-2 text-lg text-center">
                <p className="text-muted-foreground">You need to invest</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(calculations.monthlySip)}</p>
                <p className="text-muted-foreground">per month</p>
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
              <div className="flex justify-between"><span className="text-muted-foreground">Total investment</span><span className="font-medium">{formatCurrency(calculations.investedAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total interest</span><span className="font-medium">{formatCurrency(calculations.totalInterest)}</span></div>
              <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Target Amount</span><span className="font-bold text-xl">{formatCurrency(targetAmount)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalCalculator;