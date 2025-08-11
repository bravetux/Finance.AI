"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Wallet, Repeat } from "lucide-react";

const CashflowSummary: React.FC = () => {
  // State for all financial data, loading from localStorage
  const [financeData, setFinanceData] = React.useState(() => {
    try {
      const savedData = localStorage.getItem('finance-data');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to load finance data from localStorage:", error);
    }
    // Default values if nothing in localStorage
    return {
      postTaxSalaryIncome: 1200000,
      businessIncome: 500000,
      rentalProperty1: 180000,
      rentalProperty2: 120000,
      rentalProperty3: 90000,
      fdInterest: 45000,
      bondIncome: 20000,
      dividendIncome: 15000,
      monthlyHouseholdExpense: 30000,
      monthlyPpf: 12500,
      monthlyUlip: 4166.67,
      monthlyInsurance: 2500,
      monthlyRds: 2000,
      monthlyLoanEMIs: 20000,
      monthlyDonation: 833.33,
      monthlyEntertainment: 5000,
      monthlyTravel: 6666.67,
      monthlyOthers: 2083.33
    };
  });

  const [sipOutflow, setSipOutflow] = React.useState(0);

  React.useEffect(() => {
    try {
        const savedSipOutflow = localStorage.getItem('sipOutflowData');
        if (savedSipOutflow) {
            setSipOutflow(JSON.parse(savedSipOutflow));
        }
    } catch (error) {
        console.error("Failed to load SIP outflow data from localStorage:", error);
    }
  }, []);

  // Calculate totals
  const totalRentalIncome = (financeData.rentalProperty1 || 0) + (financeData.rentalProperty2 || 0) + (financeData.rentalProperty3 || 0);
  const totalAnnualIncome =
    (financeData.postTaxSalaryIncome || 0) +
    (financeData.businessIncome || 0) +
    totalRentalIncome +
    (financeData.fdInterest || 0) +
    (financeData.bondIncome || 0) +
    (financeData.dividendIncome || 0);

  const totalAnnualOutflows =
    ((financeData.monthlyHouseholdExpense || 0) +
    (financeData.monthlyPpf || 0) +
    (financeData.monthlyUlip || 0) +
    (financeData.monthlyInsurance || 0) +
    (financeData.monthlyRds || 0) +
    (financeData.monthlyLoanEMIs || 0) +
    (financeData.monthlyDonation || 0) +
    (financeData.monthlyEntertainment || 0) +
    (financeData.monthlyTravel || 0) +
    (financeData.monthlyOthers || 0)) * 12;

  const surplusCashFlow = totalAnnualIncome - totalAnnualOutflows;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cashflow Summary</h1>
      
      {/* Summary Cards Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Income</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAnnualIncome.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Summary of all income sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Outflows</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAnnualOutflows.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">Summary of all expenses and investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surplus Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${surplusCashFlow < 0 ? "text-red-500" : "text-green-500"}`}>
              ₹{surplusCashFlow.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">Income minus Outflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIP Outflow</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{sipOutflow.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">From Mutual Fund SIP page</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p>More detailed summary components will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashflowSummary;