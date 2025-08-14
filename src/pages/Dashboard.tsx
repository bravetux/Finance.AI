"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Wallet, BarChart2, PieChart, Target, Landmark } from "lucide-react";

const Dashboard: React.FC = () => {
  const [liquidFutureValue, setLiquidFutureValue] = React.useState(0);
  const [cashflowData, setCashflowData] = React.useState({ totalAnnualIncome: 0, totalAnnualOutflows: 0 });
  const [netWorthData, setNetWorthData] = React.useState({ totalAssets: 0, totalLiabilities: 0 });
  const [futureValueData, setFutureValueData] = React.useState({ totalFutureValue: 0, averageROI: 0, ageAtGoal: 0 });
  const [goalsData, setGoalsData] = React.useState({ totalGoalsFutureValue: 0, totalSipRequired: 0 });

  React.useEffect(() => {
    const updateAllValues = () => {
      try {
        // Liquid Future Value
        const savedLiquidFv = localStorage.getItem('liquidFutureValueTotal');
        setLiquidFutureValue(savedLiquidFv ? JSON.parse(savedLiquidFv) : 0);

        // Cashflow Data
        const savedCashflow = localStorage.getItem('finance-data');
        const cashflow = savedCashflow ? JSON.parse(savedCashflow) : {};
        const totalRentalIncome = (cashflow.rentalProperty1 || 0) + (cashflow.rentalProperty2 || 0) + (cashflow.rentalProperty3 || 0);
        const totalAnnualIncome = (cashflow.postTaxSalaryIncome || 0) + (cashflow.businessIncome || 0) + totalRentalIncome + (cashflow.fdInterest || 0) + (cashflow.bondIncome || 0) + (cashflow.dividendIncome || 0);
        const totalAnnualOutflows = ((cashflow.monthlyHouseholdExpense || 0) + (cashflow.monthlyPpf || 0) + (cashflow.monthlyUlip || 0) + (cashflow.monthlyInsurance || 0) + (cashflow.monthlyRds || 0) + (cashflow.monthlyLoanEMIs || 0) + (cashflow.monthlyDonation || 0) + (cashflow.monthlyEntertainment || 0) + (cashflow.monthlyTravel || 0) + (cashflow.monthlyOthers || 0)) * 12;
        setCashflowData({ totalAnnualIncome, totalAnnualOutflows });

        // Net Worth Data
        const savedNetWorth = localStorage.getItem('netWorthData');
        const netWorth = savedNetWorth ? JSON.parse(savedNetWorth) : {};
        const totalIlliquidAssets = (netWorth.homeValue || 0) + (netWorth.otherRealEstate || 0) + (netWorth.jewellery || 0) + (netWorth.sovereignGoldBonds || 0) + (netWorth.ulipsSurrenderValue || 0) + (netWorth.epfPpfVpf || 0);
        const totalLiquidAssets = (netWorth.fixedDeposits || 0) + (netWorth.debtFunds || 0) + (netWorth.domesticStocks || 0) + (netWorth.domesticMutualFunds || 0) + (netWorth.internationalFunds || 0) + (netWorth.smallCases || 0) + (netWorth.savingsBalance || 0) + (netWorth.preciousMetals || 0) + (netWorth.cryptocurrency || 0) + (netWorth.reits || 0);
        const totalAssets = totalIlliquidAssets + totalLiquidAssets;
        const totalLiabilities = (netWorth.homeLoan || 0) + (netWorth.educationLoan || 0) + (netWorth.carLoan || 0) + (netWorth.personalLoan || 0) + (netWorth.creditCardDues || 0) + (netWorth.otherLiabilities || 0);
        setNetWorthData({ totalAssets, totalLiabilities });

        // Future Value Data
        const savedFvSummary = localStorage.getItem('futureValueSummary');
        const fvSummary = savedFvSummary ? JSON.parse(savedFvSummary) : { totalFutureValue: 0, averageROI: 0, ageAtGoal: 0 };
        setFutureValueData(fvSummary);

        // Goals Data
        const savedGoals = localStorage.getItem('goalsData');
        const goals = savedGoals ? JSON.parse(savedGoals) : [];
        const totalGoalsFv = goals.reduce((sum: number, goal: any) => sum + (goal.targetFutureValue || 0), 0);
        const totalSip = goals.reduce((sum: number, goal: any) => sum + (goal.sipRequired || 0), 0);
        setGoalsData({ totalGoalsFutureValue: totalGoalsFv, totalSipRequired: totalSip });

      } catch (e) {
        console.error("Failed to parse dashboard data from localStorage", e);
      }
    };

    updateAllValues();
    window.addEventListener('storage', updateAllValues);
    return () => window.removeEventListener('storage', updateAllValues);
  }, []);

  const surplusCashFlow = cashflowData.totalAnnualIncome - cashflowData.totalAnnualOutflows;
  const netWorthValue = netWorthData.totalAssets - netWorthData.totalLiabilities;
  const totalAnnualSip = goalsData.totalSipRequired * 12;

  let goalCoverageMessage = "";
  let goalCoverageColor = "";
  if (futureValueData.totalFutureValue > 0) {
    const coverageRatio = (goalsData.totalGoalsFutureValue / futureValueData.totalFutureValue) * 100;
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
  } else if (goalsData.totalGoalsFutureValue > 0) {
    goalCoverageMessage = "Calculate Future Value of assets to assess goal coverage.";
    goalCoverageColor = "text-yellow-500";
  }

  let sipSufficiencyMessage = "";
  let sipSufficiencyColor = "";
  const monthlySurplus = surplusCashFlow / 12;
  if (goalsData.totalSipRequired > 0) {
    if (goalsData.totalSipRequired > monthlySurplus) {
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
            <div className={`text-2xl font-bold ${netWorthValue < 0 ? "text-red-500" : "text-green-500"}`}>
              ₹{netWorthValue.toLocaleString("en-IN")}
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
              ₹{futureValueData.totalFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              at age {futureValueData.ageAtGoal} (Avg. ROI: {futureValueData.averageROI.toFixed(2)}%)
            </p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Cashflow Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Total Annual Income:</span><span className="font-medium">₹{cashflowData.totalAnnualIncome.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Total Annual Outflows:</span><span className="font-medium">₹{cashflowData.totalAnnualOutflows.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold">Surplus Cash Flow:</span><span className={`font-bold ${surplusCashFlow < 0 ? "text-red-500" : "text-green-500"}`}>₹{surplusCashFlow.toLocaleString("en-IN")}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Net Worth Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Total Assets:</span><span className="font-medium">₹{netWorthData.totalAssets.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Total Liabilities:</span><span className="font-medium">₹{netWorthData.totalLiabilities.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold">Net Worth:</span><span className={`font-bold ${netWorthValue < 0 ? "text-red-500" : "text-green-500"}`}>₹{netWorthValue.toLocaleString("en-IN")}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Future Value Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Total Current Value:</span><span className="font-medium">₹{(netWorthData.totalAssets).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span>Average ROI:</span><span className="font-medium">{futureValueData.averageROI.toFixed(2)}%</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold">Total Future Value (at age {futureValueData.ageAtGoal}):</span><span className="font-bold text-green-600">₹{futureValueData.totalFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Goals Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>Total Target Future Value:</span><span className="font-medium text-green-600">₹{goalsData.totalGoalsFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between"><span className="font-bold">Total Monthly SIP Required:</span><span className="font-bold text-blue-600">₹{goalsData.totalSipRequired.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="font-bold">Total Annual SIP Required:</span><span className="font-bold text-blue-600">₹{totalAnnualSip.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
            </div>
            {(goalCoverageMessage || sipSufficiencyMessage) && (
              <div className="border-t pt-2 space-y-1">
                {goalCoverageMessage && (<p className={`text-sm font-semibold ${goalCoverageColor}`}>{goalCoverageMessage}</p>)}
                {sipSufficiencyMessage && (<p className={`text-sm font-semibold ${sipSufficiencyColor}`}>{sipSufficiencyMessage}</p>)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;