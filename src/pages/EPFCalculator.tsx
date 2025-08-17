"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const EPFCalculator: React.FC = () => {
  const [monthlySalary, setMonthlySalary] = useState(50000);
  const [age, setAge] = useState(30);
  const [contribution, setContribution] = useState(12);
  const [salaryIncrease, setSalaryIncrease] = useState(5);
  const [interestRate, setInterestRate] = useState(8.25);
  const retirementAge = 58;

  const { accumulatedAmount, totalInvestment, totalInterest } = useMemo(() => {
    let balance = 0;
    let currentMonthlySalary = monthlySalary;
    let totalInvested = 0;
    const yearsToRetire = retirementAge - age;

    if (yearsToRetire <= 0) {
      return { accumulatedAmount: 0, totalInvestment: 0, totalInterest: 0 };
    }

    for (let i = 0; i < yearsToRetire; i++) {
      const annualContribution = currentMonthlySalary * 12 * (contribution / 100) * 2;
      totalInvested += annualContribution;
      const interest = balance * (interestRate / 100);
      balance += interest + annualContribution;
      currentMonthlySalary *= 1 + salaryIncrease / 100;
    }

    const interestEarned = balance - totalInvested;

    return {
      accumulatedAmount: balance,
      totalInvestment: totalInvested,
      totalInterest: interestEarned,
    };
  }, [monthlySalary, age, contribution, salaryIncrease, interestRate]);

  const chartData = [
    { name: "Total investment", value: totalInvestment },
    { name: "Total interest", value: totalInterest },
  ];

  const COLORS = ["#C7D2FE", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        EPF Calculator
      </h1>

      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Monthly Salary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Monthly salary (Basic + DA)</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {formatCurrency(monthlySalary)}
                </span>
              </div>
              <Slider
                value={[monthlySalary]}
                onValueChange={(val) => setMonthlySalary(val[0])}
                min={15000}
                max={500000}
                step={1000}
              />
            </div>

            {/* Your Age */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Your age</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {age} Yr
                </span>
              </div>
              <Slider
                value={[age]}
                onValueChange={(val) => setAge(val[0])}
                min={18}
                max={57}
                step={1}
              />
            </div>

            {/* Contribution to EPF */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Your contribution to EPF</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {contribution}%
                </span>
              </div>
              <Slider
                value={[contribution]}
                onValueChange={(val) => setContribution(val[0])}
                min={12}
                max={25}
                step={0.5}
              />
            </div>

            {/* Annual Increase in Salary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Annual increase in salary</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {salaryIncrease}%
                </span>
              </div>
              <Slider
                value={[salaryIncrease]}
                onValueChange={(val) => setSalaryIncrease(val[0])}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Rate of Interest */}
            <div>
              <div className="flex justify-between items-center">
                <label className="font-medium">Rate of interest</label>
                <div className="relative w-28">
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
          </div>

          <div className="flex flex-col items-center">
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
            <div className="w-full max-w-sm mt-6 space-y-2 text-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total investment</span>
                <span className="font-medium">{formatCurrency(totalInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-medium">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Accumulated amount</span>
                <span className="font-bold text-xl">{formatCurrency(accumulatedAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EPFCalculator;