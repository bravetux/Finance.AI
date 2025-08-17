"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

const PPFCalculator: React.FC = () => {
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [timePeriod, setTimePeriod] = useState(15);
  const [interestRate, setInterestRate] = useState(7.1);

  const calculations = useMemo(() => {
    const P = yearlyInvestment;
    const i = interestRate / 100;
    const n = timePeriod;

    if (i === 0 || n === 0) {
      const maturityValue = P * n;
      const investedAmount = P * n;
      return { investedAmount, totalInterest: 0, maturityValue };
    }

    // F = P [({(1+i) ^n}-1)/i]
    const maturityValue = P * ((Math.pow(1 + i, n) - 1) / i);
    const investedAmount = P * n;
    const totalInterest = maturityValue - investedAmount;

    return { investedAmount, totalInterest, maturityValue };
  }, [yearlyInvestment, timePeriod, interestRate]);

  const chartData = [
    { name: "Total investment", value: calculations.investedAmount },
    { name: "Total interest", value: calculations.totalInterest },
  ];

  const COLORS = ["#C7D2FE", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        PPF Calculator
      </h1>

      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
          {/* Left Side - Inputs & Summary */}
          <div className="space-y-8 flex flex-col">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Yearly investment</label>
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
                  {formatCurrency(yearlyInvestment)}
                </span>
              </div>
              <Slider
                value={[yearlyInvestment]}
                onValueChange={(val) => setYearlyInvestment(val[0])}
                min={500}
                max={150000}
                step={500}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Time period (in years)</label>
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
                  {timePeriod} Yr
                </span>
              </div>
              <Slider
                value={[timePeriod]}
                onValueChange={(val) => setTimePeriod(val[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Rate of interest</label>
                <div className="relative w-24">
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="pr-8 text-right font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            <div className="mt-auto space-y-2 text-lg border-t pt-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invested amount</span>
                <span className="font-medium">{formatCurrency(calculations.investedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-medium">{formatCurrency(calculations.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Maturity value</span>
                <span className="font-bold text-xl">{formatCurrency(calculations.maturityValue)}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Chart */}
          <div className="flex flex-col items-center justify-between">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <Button className="bg-green-500 hover:bg-green-600">SAVE TAX</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPFCalculator;