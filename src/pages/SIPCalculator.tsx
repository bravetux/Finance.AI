"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

const SIPCalculator: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const calculations = useMemo(() => {
    const P = monthlyInvestment;
    const i = returnRate / 12 / 100;
    const n = timePeriod * 12;

    if (i === 0) { // Handle case where return rate is 0
        const totalValue = P * n;
        const investedAmount = P * n;
        return { investedAmount, estimatedReturns: 0, totalValue };
    }

    const totalValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const investedAmount = P * n;
    const estimatedReturns = totalValue - investedAmount;

    return {
      investedAmount,
      estimatedReturns,
      totalValue,
    };
  }, [monthlyInvestment, returnRate, timePeriod]);

  const chartData = [
    { name: "Invested amount", value: calculations.investedAmount },
    { name: "Est. returns", value: calculations.estimatedReturns },
  ];

  const COLORS = ["#E0E7FF", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        SIP Calculator
      </h1>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="sip">
            <TabsList className="grid w-full grid-cols-2 md:w-1/3">
              <TabsTrigger value="sip">SIP</TabsTrigger>
              <TabsTrigger value="lumpsum" disabled>Lumpsum</TabsTrigger>
            </TabsList>
            <TabsContent value="sip">
              <div className="grid md:grid-cols-2 gap-8 mt-6">
                {/* Left Side - Sliders */}
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Monthly investment</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                        {formatCurrency(monthlyInvestment)}
                      </span>
                    </div>
                    <Slider
                      value={[monthlyInvestment]}
                      onValueChange={(val) => setMonthlyInvestment(val[0])}
                      min={500}
                      max={500000}
                      step={500}
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
                      max={30}
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

                {/* Right Side - Chart and Summary */}
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
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
                      <span className="text-muted-foreground">Invested amount</span>
                      <span className="font-medium">{formatCurrency(calculations.investedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. returns</span>
                      <span className="font-medium">{formatCurrency(calculations.estimatedReturns)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-bold">Total value</span>
                      <span className="font-bold text-xl">{formatCurrency(calculations.totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SIPCalculator;