"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

const EPFCalculator: React.FC = () => {
  const [monthlySalary, setMonthlySalary] = useState(50000);
  const [age, setAge] = useState(30);
  const [contribution, setContribution] = useState(12);
  const [salaryIncrease, setSalaryIncrease] = useState(5);
  const [interestRate, setInterestRate] = useState(8.25);
  const retirementAge = 58;

  const accumulatedAmount = useMemo(() => {
    let balance = 0;
    let currentMonthlySalary = monthlySalary;
    const yearsToRetire = retirementAge - age;

    if (yearsToRetire <= 0) return 0;

    for (let i = 0; i < yearsToRetire; i++) {
      // Assuming employer matches the employee's contribution for this calculation
      const annualContribution = currentMonthlySalary * 12 * (contribution / 100) * 2;
      const interest = balance * (interestRate / 100);
      balance += interest + annualContribution;
      currentMonthlySalary *= (1 + salaryIncrease / 100);
    }

    return balance;
  }, [monthlySalary, age, contribution, salaryIncrease, interestRate]);

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
        <CardContent className="pt-6 max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Monthly Salary */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Monthly salary (Basic + DA)</label>
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
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
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
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
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
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
                <span className="text-lg font-bold text-green-600 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-md">
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
                    className="pr-8 text-right font-bold bg-green-100 dark:bg-green-900/50 border-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="text-center pt-8">
              <p className="text-muted-foreground">You will have accumulated</p>
              <p className="text-4xl md:text-5xl font-bold text-primary my-2">
                {formatCurrency(accumulatedAmount)}
              </p>
              <p className="text-muted-foreground">by the time you retire</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EPFCalculator;