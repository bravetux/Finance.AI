"use client";

import React from<think>**Adding Comprehensive Data Reset**

I've now moved the "Reset All Data" function into the Reports page. I've expanded the `keysToRemove` array to be more inclusive. The new "Clear All LocalStorage" button and its dialog are also implemented, ensuring a more comprehensive data management system. I'm focused on final testing.


</think> "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Wallet, BarChart2, PieChart, Target, Landmark } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

const Dashboard: React.FC = () => {
  // Get data from localStorage or use defaults
  const getCashflowData = () => {
    try {
      const savedData = localStorage.getItem('finance-data');
      return savedData ? JSON.parse(savedData) : {
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
    } catch {
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
    }
  };

  const getNetWorthData = () => {
    try {
      const savedData = localStorage.getItem('netWorthData');
      return savedData ? JSON.parse(savedData) : {
        homeValue: 0,
        otherRealEstate: 0,
        jewellery: 0,
        sovereignGoldBonds: 0,
        ulipsSurrenderValue: 0,
        epfPpfVpf: 0,
        fixedDeposits: 0,
        debtFunds: 0,
        domesticStocks: 0,
        domesticMutualFunds: 0,
        internationalFunds: 0,
        smallCases: 0,
        savingsBalance: 0,
        goldEtf: 0,
        cryptocurrency: 0,
        reits: 0,
        homeLoan: 0,
        educationLoan: 0,
        carLoan: 0,
        personalLoan: 0,
        creditCardDues: 0,
        otherLiabilities: 0
      };
    } catch {
      return {
        homeValue: 0,
        otherRealEstate: 0,
        jewellery: 0,
        sovereignGoldBonds: 0,
        ulipsSurrenderValue: 0,
        epfPpfVpf: 0,
        fixedDeposits: 0,
        debtFunds: 0,
        domesticStocks: 0,
        domesticMutualFunds: 0,
        internationalFunds: 0,
        smallCases: 0,
        savingsBalance: 0,
        goldEtf: 0,
        cryptocurrency: 0,
        reits: 0,
        homeLoan: 0,
        educationLoan: 0,
        carLoan: 0,
        personalLoan: 0,
        creditCardDues: 0,
        otherLiabilities: 0
      };
    }
  };

  const getFutureValueData = () => {
    try {
      const savedData = localStorage.getItem('future-value-data');
      return savedData ? JSON.parse(savedData) : [];
    } catch {
      return [];
    }
  };

  const getGoalsData = () => {
    try {
      const savedData = localStorage.getItem('goalsData');
      return savedData ? JSON.parse(savedData) : [];
    } catch {
      return [];
    }
  };

  // Calculate cashflow data
  const cashflowData = getCashflowData();
  const totalRentalIncome = (cashflowData.rentalProperty1 || 0) + (cashflowData.rentalProperty2 || 0) + (cashflowData.rentalProperty3 || 0);
  const totalAnnualIncome =
    (cashflowData.postTaxSalaryIncome || 0) +
    (cashflowData.businessIncome || 0) +
    totalRentalIncome +
    (cashflowData.fdInterest || 0) +
    (cashflowData.bondIncome || 0) +
    (cashflowData.dividendIncome || 0);

  const totalAnnualOutflows =
    ((cashflowData.monthlyHouseholdExpense || 0) +
    (cashflowData.monthlyPpf || 0) +
    (cashflowData.monthlyUlip || 0) +
    (cashflowData.monthlyInsurance || 0) +
    (cashflowData.monthlyRds || 0) +
    (cashflowData.monthlyLoanEMIs || 0) +
    (cashflowData.monthlyDonation || 0) +
    (cashflowData.monthlyEntertainment || 0) +
    (cashflowData.monthlyTravel || 0) +
    (cashflowData.monthlyOthers || 0)) * 12;

  const surplusCashFlow = totalAnnualIncome - totalAnnualOutflows;

  // Calculate net worth data
  const netWorthData = getNetWorthData();
  const totalIlliquidAssets = netWorthData.homeValue + netWorthData.otherRealEstate + netWorthData.jewellery + 
                            netWorthData.sovereignGoldBonds + netWorthData.ulipsSurrenderValue + netWorthData.epfPpfVpf;
  const totalLiquidAssets = netWorthData.fixedDeposits + netWorthData.debtFunds + netWorthData.domesticStocks + 
                          netWorthData.domesticMutualFunds + netWorthData.internationalFunds + netWorthData.smallCases + 
                          netWorthData.savingsBalance + netWorthData.goldEtf + netWorthData.cryptocurrency + netWorthData.reits;
  const totalAssets = totalIlliquidAssets + totalLiquidAssets;
  const totalLiabilities = netWorthData.homeLoan + netWorthData.educationLoan + netWorthData.carLoan + 
                         netWorthData.personalLoan + netWorthData.creditCardDues + netWorthData.otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  // Calculate future value data
  const futureValueData = getFutureValueData();
  const totalFutureValue = futureValueData.reduce((sum: number, asset: any) => sum + asset.futureValue, 0);
  const averageROI = futureValueData.length > 0 
    ? futureValueData.reduce((sum: number, asset: any) => sum + asset.roi, 0) / futureValueData.length
    : 0;

  // Calculate Liquid Future Value
  const illiquidAssetNames = ["Home Value", "Other Real Estate", "Jewellery"];
  const illiquidFutureValue = futureValueData
      .filter((asset: any) => illiquidAssetNames.includes(asset.name))
      .reduce((sum: number, asset: any) => sum + asset.futureValue, 0);
  const liquidFutureValue = totalFutureValue - illiquidFutureValue;

  // Calculate goals data
  const goalsData = getGoalsData();
  const totalGoalsFutureValue = goalsData.reduce((sum: number, goal: any) => sum + (goal.targetFutureValue || 0), 0);
  const totalSipRequired = goalsData.reduce((sum: number, goal: any) => sum + (goal.sipRequired || 0), 0);
  const totalAnnualSip = totalSipRequired * 12;

  // Goal Coverage Logic
  let goalCoverageMessage = "";
  let goalCoverageColor = "";

  if (totalFutureValue > 0) {
      const coverageRatio = (totalGoalsFutureValue / totalFutureValue) * 100;
      if (coverageRatio <= 25) {
          goalCoverageMessage = "Goals are well covered within 25% of FV";
          goalCoverageColor = "text-green-600";
      } else if (coverageRatio > 25 && coverageRatio <= 45) {
          goalCoverageMessage = "Goals are moderately covered";
          goalCoverageColor = "text-orange-500";
      } else {
          goalCoverageMessage = "Goal is poorly covered, Might affect Retirement";
          goalCoverageColor = "text-red-500";
      }
  } else if (totalGoalsFutureValue > 0) {
      goalCoverageMessage = "Calculate Future Value of assets to assess goal coverage.";
      goalCoverageColor = "text-yellow-500";
  }

  // SIP Sufficiency Logic
  let sipSufficiencyMessage = "";
  let sipSufficiencyColor = "";
  const monthlySurplus = surplusCashFlow / 12;

  if (totalSipRequired > 0) {
    if (totalSipRequired > monthlySurplus) {
      sipSufficiencyMessage = "Funds not sufficient to do SIP, Rework your Goal and Expenses";
      sipSufficiencyColor = "text-red-500";
    } else {
      sipSufficiencyMessage = "Funds are sufficient to Achieve Goals";
      sipSufficiencyColor = "text-green-600";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surplus Cash Flow</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${surplusCashFlow < 0 ? "text-red-500" : "text-green-500"}`}>
              ₹{surplusCashFlow.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">From Cashflow</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth < 0 ? "text-red-500" : "text-green-500"}`}>
              ₹{netWorth.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">From Net Worth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Future Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Average ROI: {averageROI.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquid Future Value</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{liquidFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Excludes real estate & jewellery</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Cashflow Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Cashflow Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Annual Income:</span>
              <span className="font-medium">₹{totalAnnualIncome.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Annual Outflows:</span>
              <span className="font-medium">₹{totalAnnualOutflows.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Surplus Cash Flow:</span>
              <span className={`font-bold ${surplusCashFlow < 0 ? "text-red-500" : "text-green-500"}`}>
                ₹{surplusCashFlow.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Net Worth Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Net Worth Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Assets:</span>
              <span className="font-medium">₹{totalAssets.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Liabilities:</span>
              <span className="font-medium">₹{totalLiabilities.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Net Worth:</span>
              <span className={`font-bold ${netWorth < 0 ? "text-red-500" : "text-green-500"}`}>
                ₹{netWorth.toLocaleString("en-IN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Future Value Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Future Value Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Current Value:</span>
              <span className="font-medium">
                ₹{futureValueData.reduce((sum: number, asset: any) => sum + asset.currentValue, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average ROI:</span>
              <span className="font-medium">
                {averageROI.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total Future Value:</span>
              <span className="font-bold text-green-600">
                ₹{totalFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Goals Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Target Future Value:</span>
              <span className="font-medium text-green-600">
                ₹{totalGoalsFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-bold">Total Monthly SIP Required:</span>
                <span className="font-bold text-blue-600">
                  ₹{totalSipRequired.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Total Annual SIP Required:</span>
                <span className="font-bold text-blue-600">
                  ₹{totalAnnualSip.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {(goalCoverageMessage || sipSufficiencyMessage) && (
              <div className="border-t pt-2 space-y-1">
                {goalCoverageMessage && (
                  <p className={`text-sm font-semibold ${goalCoverageColor}`}>
                    {goalCoverageMessage}
                  </p>
                )}
                {sipSufficiencyMessage && (
                  <p className={`text-sm font-semibold ${sipSufficiencyColor}`}>
                    {sipSufficiencyMessage}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;