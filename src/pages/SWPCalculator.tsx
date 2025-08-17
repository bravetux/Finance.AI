"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

const SWPCalculator: React.FC = () => {
  const [totalInvestment, setTotalInvestment] = useState(500000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(10000);
  const [returnRate, setReturnRate] = useState(8);
  const [timePeriod, setTimePeriod] = useState(5);

  const calculations = useMemo(() => {
    let currentBalance = totalInvestment;
    const monthlyReturnRate = returnRate / 12 / 100;
    const numberOfMonths = timePeriod * 12;

    if (totalInvestment <= 0 || numberOfMonths <= 0) {
      return {
        totalInvestment: totalInvestment,
        totalWithdrawal: 0,
        finalValue: totalInvestment,
      };
    }

    for (let i = 0; i < numberOfMonths; i++) {
      currentBalance += currentBalance * monthlyReturnRate; // Add interest
      currentBalance -= monthlyWithdrawal; // Subtract withdrawal
      if (currentBalance < 0) {
        currentBalance = 0;
        break;
      }
    }

    const totalWithdrawal = monthlyWithdrawal * numberOfMonths;

    return {
      totalInvestment: totalInvestment,
      totalWithdrawal: totalWithdrawal,
      finalValue: currentBalance,
    };
  }, [totalInvestment, monthlyWithdrawal, returnRate, timePeriod]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        SWP (Systematic Withdrawal Plan) Calculator
      </h1>

      <Card>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Total investment</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
              <Slider
                value={[totalInvestment]}
                onValueChange={(val) => setTotalInvestment(val[0])}
                min={100000}
                max={20000000}
                step={100000}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Withdrawal per month</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {formatCurrency(monthlyWithdrawal)}
                </span>
              </div>
              <Slider
                value={[monthlyWithdrawal]}
                onValueChange={(val) => setMonthlyWithdrawal(val[0])}
                min={1000}
                max={200000}
                step={1000}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Expected return rate (p.a)</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {returnRate}%
                </span>
              </div>
              <Slider
                value={[returnRate]}
                onValueChange={(val) => setReturnRate(val[0])}
                min={1}
                max={20}
                step={0.5}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Time period</label>
                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                  {timePeriod} Yr
                </span>
              </div>
              <Slider
                value={[timePeriod]}
                onValueChange={(val) => setTimePeriod(val[0])}
                min={1}
                max={40}
                step={1}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center bg-muted/50 rounded-lg p-8">
            <div className="w-full max-w-sm space-y-4 text-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total investment</span>
                <span className="font-medium">{formatCurrency(calculations.totalInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total withdrawal</span>
                <span className="font-medium">{formatCurrency(calculations.totalWithdrawal)}</span>
              </div>
              <div className="flex justify-between border-t pt-4 mt-4">
                <span className="font-bold">Final value</span>
                <span className="font-bold text-2xl text-primary">{formatCurrency(calculations.finalValue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SWPCalculator;