"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BrainCircuit, DollarSign, Lightbulb, PiggyBank, TrendingDown, TrendingUp, Zap, BarChartHorizontal, FileText } from "lucide-react";

// Helper to safely parse localStorage data
const safeJSONParse = (key: string, defaultValue: any = {}) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse JSON for key: ${key}`, e);
    return defaultValue;
  }
};

const AIInsights: React.FC = () => {
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);

  useEffect(() => {
    const updateData = () => {
      // Net Worth Data
      const netWorthData = safeJSONParse('netWorthData');
      const totalAssets = (netWorthData.homeValue || 0) + (netWorthData.otherRealEstate || 0) + (netWorthData.jewellery || 0) + 
                            (netWorthData.sovereignGoldBonds || 0) + (netWorthData.ulipsSurrenderValue || 0) + (netWorthData.epfPpfVpf || 0) +
                            (netWorthData.fixedDeposits || 0) + (netWorthData.debtFunds || 0) + (netWorthData.domesticStocks || 0) + 
                            (netWorthData.domesticMutualFunds || 0) + (netWorthData.internationalFunds || 0) + (netWorthData.smallCases || 0) + 
                            (netWorthData.savingsBalance || 0) + (netWorthData.preciousMetals || 0) + (netWorthData.cryptocurrency || 0) + (netWorthData.reits || 0);
      const totalLiabilities = (netWorthData.homeLoan || 0) + (netWorthData.educationLoan || 0) + (netWorthData.carLoan || 0) + 
                               (netWorthData.personalLoan || 0) + (netWorthData.creditCardDues || 0) + (netWorthData.otherLiabilities || 0);
      setNetWorth(totalAssets - totalLiabilities);

      // Cashflow Data
      const cashflowData = safeJSONParse('finance-data');
      const totalAnnualIncome = (cashflowData.postTaxSalaryIncome || 0) + (cashflowData.businessIncome || 0) + 
                                (cashflowData.rentalProperty1 || 0) + (cashflowData.rentalProperty2 || 0) + (cashflowData.rentalProperty3 || 0) +
                                (cashflowData.fdInterest || 0) + (cashflowData.bondIncome || 0) + (cashflowData.dividendIncome || 0);
      const totalAnnualOutflows = ((cashflowData.monthlyHouseholdExpense || 0) + (cashflowData.monthlyPpf || 0) + 
                                   (cashflowData.monthlyUlip || 0) + (cashflowData.monthlyInsurance || 0) + 
                                   (cashflowData.monthlyRds || 0) + (cashflowData.monthlyLoanEMIs || 0) + 
                                   (cashflowData.monthlyDonation || 0) + (cashflowData.monthlyEntertainment || 0) + 
                                   (cashflowData.monthlyTravel || 0) + (cashflowData.monthlyOthers || 0)) * 12;
      
      setMonthlyIncome(totalAnnualIncome / 12);
      setMonthlySpending(totalAnnualOutflows / 12);
    };

    updateData();
    window.addEventListener('storage', updateData);
    return () => window.removeEventListener('storage', updateData);
  }, []);

  const monthlySavings = monthlyIncome - monthlySpending;

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">AI-powered financial recommendations</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Net Worth</p>
          <p className="text-xl font-bold">{formatCurrency(netWorth)}</p>
          <p className="text-sm text-green-500">+5.2% this month</p>
        </div>
      </div>

      {/* Top Row Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <BrainCircuit className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active recommendations</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(340 * 12)}</div>
            <p className="text-xs text-muted-foreground">Annual opportunity</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Average accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChartHorizontal className="h-5 w-5" /> Monthly Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-3 text-center">
          <div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><TrendingDown className="h-4 w-4 text-red-500" /> Spending</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(monthlySpending)}</p>
            <p className="text-sm text-red-500">-7.95% from last month</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> Income</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-green-500">+8.23% from last month</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><PiggyBank className="h-4 w-4 text-blue-500" /> Savings</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(monthlySavings)}</p>
            <p className="text-sm text-green-500">+28.57% from last month</p>
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" /> AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-lg">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Optimize Your Savings Strategy <Badge variant="destructive">high</Badge></h3>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Based on your spending patterns, you could save an additional {formatCurrency(340)}/month by adjusting your discretionary expenses.</p>
              <div className="flex items-center gap-4 text-xs mt-2">
                <span className="font-bold text-green-600">+{formatCurrency(4080)}/year</span>
                <span className="text-muted-foreground">92% confidence</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/30 rounded-r-lg">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Subscription Audit Recommended <Badge variant="secondary">medium</Badge></h3>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">You have 8 active subscriptions totaling {formatCurrency(127 * 80)}/month. Some appear to be underutilized.</p>
              <div className="flex items-center gap-4 text-xs mt-2">
                <span className="font-bold text-orange-600">-{formatCurrency(456 * 80)}/year</span>
                <span className="text-muted-foreground">87% confidence</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;