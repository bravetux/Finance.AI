"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PPFCalculator: React.FC = () => {
  // State for Yearly Investment Calculator
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [yearlyTimePeriod, setYearlyTimePeriod] = useState(15);
  const [yearlyInterestRate, setYearlyInterestRate] = useState(7.1);

  // State for Lumpsum Calculator
  const [lumpsumInvestment, setLumpsumInvestment] = useState(1000000);
  const [lumpsumTimePeriod, setLumpsumTimePeriod] = useState(15);
  const [lumpsumInterestRate, setLumpsumInterestRate] = useState(7.1);

  const yearlyCalculations = useMemo(() => {
    const P = yearlyInvestment;
    const i = yearlyInterestRate / 100;
    const n = yearlyTimePeriod;

    if (i === 0 || n === 0) {
      const maturityValue = P * n;
      const investedAmount = P * n;
      return { investedAmount, totalInterest: 0, maturityValue };
    }

    const maturityValue = P * ((Math.pow(1 + i, n) - 1) / i);
    const investedAmount = P * n;
    const totalInterest = maturityValue - investedAmount;

    return { investedAmount, totalInterest, maturityValue };
  }, [yearlyInvestment, yearlyTimePeriod, yearlyInterestRate]);

  const lumpsumCalculations = useMemo(() => {
    const P = lumpsumInvestment;
    const i = lumpsumInterestRate / 100;
    const n = lumpsumTimePeriod;

    const maturityValue = P * Math.pow(1 + i, n);
    const investedAmount = P;
    const totalInterest = maturityValue - investedAmount;

    return { investedAmount, totalInterest, maturityValue };
  }, [lumpsumInvestment, lumpsumTimePeriod, lumpsumInterestRate]);

  const yearlyChartData = [
    { name: "Total investment", value: yearlyCalculations.investedAmount },
    { name: "Total interest", value: yearlyCalculations.totalInterest },
  ];

  const lumpsumChartData = [
    { name: "Invested amount", value: lumpsumCalculations.investedAmount },
    { name: "Total interest", value: lumpsumCalculations.totalInterest },
  ];

  const COLORS = ["#C7D2FE", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        PPF & Lumpsum Calculator
      </h1>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="yearly">
            <TabsList className="grid w-full grid-cols-2 md:w-1/3">
              <TabsTrigger value="yearly">Yearly Investment</TabsTrigger>
              <TabsTrigger value="lumpsum">Lumpsum</TabsTrigger>
            </TabsList>

            {/* Yearly Investment Calculator Content */}
            <TabsContent value="yearly">
              <div className="grid md:grid-cols-2 gap-8 mt-6">
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
                        {yearlyTimePeriod} Yr
                      </span>
                    </div>
                    <Slider
                      value={[yearlyTimePeriod]}
                      onValueChange={(val) => setYearlyTimePeriod(val[0])}
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
                          value={yearlyInterestRate}
                          onChange={(e) => setYearlyInterestRate(Number(e.target.value))}
                          className="pr-8 text-right font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto space-y-2 text-lg border-t pt-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invested amount</span>
                      <span className="font-medium">{formatCurrency(yearlyCalculations.investedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total interest</span>
                      <span className="font-medium">{formatCurrency(yearlyCalculations.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Maturity value</span>
                      <span className="font-bold text-xl">{formatCurrency(yearlyCalculations.maturityValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Chart */}
                <div className="flex flex-col items-center justify-between">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={yearlyChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {yearlyChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <Button className="bg-green-500 hover:bg-green-600">SAVE TAX</Button>
                </div>
              </div>
            </TabsContent>

            {/* Lumpsum Calculator Content */}
            <TabsContent value="lumpsum">
              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Total investment</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                        {formatCurrency(lumpsumInvestment)}
                      </span>
                    </div>
                    <Slider value={[lumpsumInvestment]} onValueChange={(val) => setLumpsumInvestment(val[0])} min={10000} max={10000000} step={10000} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Time period</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{lumpsumTimePeriod} Yr</span>
                    </div>
                    <Slider value={[lumpsumTimePeriod]} onValueChange={(val) => setLumpsumTimePeriod(val[0])} min={1} max={40} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="font-medium">Rate of interest</label>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          value={lumpsumInterestRate}
                          onChange={(e) => setLumpsumInterestRate(Number(e.target.value))}
                          className="pr-8 text-right font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto space-y-2 text-lg border-t pt-6">
                    <div className="flex justify-between"><span className="text-muted-foreground">Invested amount</span><span className="font-medium">{formatCurrency(lumpsumCalculations.investedAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total interest</span><span className="font-medium">{formatCurrency(lumpsumCalculations.totalInterest)}</span></div>
                    <div className="flex justify-between"><span className="font-bold">Maturity value</span><span className="font-bold text-xl">{formatCurrency(lumpsumCalculations.maturityValue)}</span></div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={lumpsumChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {lumpsumChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPFCalculator;