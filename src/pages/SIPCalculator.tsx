"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calculator } from "lucide-react";

const SIPCalculator: React.FC = () => {
  // State for SIP Calculator
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [sipReturnRate, setSipReturnRate] = useState(12);
  const [sipTimePeriod, setSipTimePeriod] = useState(10);

  // State for Lumpsum Calculator
  const [lumpsumInvestment, setLumpsumInvestment] = useState(1000000);
  const [lumpsumReturnRate, setLumpsumReturnRate] = useState(12);
  const [lumpsumTimePeriod, setLumpsumTimePeriod] = useState(10);

  const sipCalculations = useMemo(() => {
    const P = monthlyInvestment;
    const i = sipReturnRate / 12 / 100;
    const n = sipTimePeriod * 12;

    if (i === 0) {
      const totalValue = P * n;
      return { investedAmount: totalValue, estimatedReturns: 0, totalValue };
    }

    const totalValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const investedAmount = P * n;
    const estimatedReturns = totalValue - investedAmount;

    return { investedAmount, estimatedReturns, totalValue };
  }, [monthlyInvestment, sipReturnRate, sipTimePeriod]);

  const lumpsumCalculations = useMemo(() => {
    const P = lumpsumInvestment;
    const r = lumpsumReturnRate / 100;
    const n = lumpsumTimePeriod;

    const totalValue = P * Math.pow(1 + r, n);
    const investedAmount = P;
    const estimatedReturns = totalValue - investedAmount;

    return { investedAmount, estimatedReturns, totalValue };
  }, [lumpsumInvestment, lumpsumReturnRate, lumpsumTimePeriod]);

  const sipChartData = [
    { name: "Invested amount", value: sipCalculations.investedAmount },
    { name: "Est. returns", value: sipCalculations.estimatedReturns },
  ];

  const lumpsumChartData = [
    { name: "Invested amount", value: lumpsumCalculations.investedAmount },
    { name: "Est. returns", value: lumpsumCalculations.estimatedReturns },
  ];

  const COLORS = ["#E0E7FF", "#4F46E5"];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        SIP & Lumpsum Calculator
      </h1>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="sip">
            <TabsList className="grid w-full grid-cols-2 md:w-1/3">
              <TabsTrigger value="sip">SIP</TabsTrigger>
              <TabsTrigger value="lumpsum">Lumpsum</TabsTrigger>
            </TabsList>
            
            {/* SIP Calculator Content */}
            <TabsContent value="sip">
              <div className="grid md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Monthly investment</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                        {formatCurrency(monthlyInvestment)}
                      </span>
                    </div>
                    <Slider value={[monthlyInvestment]} onValueChange={(val) => setMonthlyInvestment(val[0])} min={500} max={500000} step={500} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Expected return rate (p.a)</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{sipReturnRate}%</span>
                    </div>
                    <Slider value={[sipReturnRate]} onValueChange={(val) => setSipReturnRate(val[0])} min={1} max={30} step={0.5} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Time period</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{sipTimePeriod} Yr</span>
                    </div>
                    <Slider value={[sipTimePeriod]} onValueChange={(val) => setSipTimePeriod(val[0])} min={1} max={40} step={1} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sipChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {sipChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full max-w-sm mt-6 space-y-2 text-lg">
                    <div className="flex justify-between"><span className="text-muted-foreground">Invested amount</span><span className="font-medium">{formatCurrency(sipCalculations.investedAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Est. returns</span><span className="font-medium">{formatCurrency(sipCalculations.estimatedReturns)}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total value</span><span className="font-bold text-xl">{formatCurrency(sipCalculations.totalValue)}</span></div>
                  </div>
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
                      <label className="font-medium">Expected return rate (p.a)</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{lumpsumReturnRate}%</span>
                    </div>
                    <Slider value={[lumpsumReturnRate]} onValueChange={(val) => setLumpsumReturnRate(val[0])} min={1} max={30} step={0.5} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Time period</label>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{lumpsumTimePeriod} Yr</span>
                    </div>
                    <Slider value={[lumpsumTimePeriod]} onValueChange={(val) => setLumpsumTimePeriod(val[0])} min={1} max={40} step={1} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={lumpsumChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {lumpsumChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full max-w-sm mt-6 space-y-2 text-lg">
                    <div className="flex justify-between"><span className="text-muted-foreground">Invested amount</span><span className="font-medium">{formatCurrency(lumpsumCalculations.investedAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Est. returns</span><span className="font-medium">{formatCurrency(lumpsumCalculations.estimatedReturns)}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total value</span><span className="font-bold text-xl">{formatCurrency(lumpsumCalculations.totalValue)}</span></div>
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