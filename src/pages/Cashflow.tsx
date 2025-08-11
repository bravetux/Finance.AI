"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Wallet, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
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

interface FinanceData {
  // Income
  postTaxSalaryIncome: number;
  businessIncome: number;
  rentalProperty1: number;
  rentalProperty2: number;
  rentalProperty3: number;
  fdInterest: number;
  bondIncome: number;
  dividendIncome: number;
  
  // Outflows
  monthlyHouseholdExpense: number;
  monthlyPpf: number;
  monthlyUlip: number;
  monthlyInsurance: number;
  monthlyRds: number;
  monthlyLoanEMIs: number;
  monthlyDonation: number;
  monthlyEntertainment: number;
  monthlyTravel: number;
  monthlyOthers: number;
}

const defaultFinanceData: FinanceData = {
  postTaxSalaryIncome: 0, businessIncome: 0,
  rentalProperty1: 0, rentalProperty2: 0, rentalProperty3: 0,
  fdInterest: 0, bondIncome: 0, dividendIncome: 0,
  monthlyHouseholdExpense: 0, monthlyPpf: 0, monthlyUlip: 0,
  monthlyInsurance: 0, monthlyRds: 0, monthlyLoanEMIs: 0,
  monthlyDonation: 0, monthlyEntertainment: 0, monthlyTravel: 0,
  monthlyOthers: 0
};

const Cashflow: React.FC = () => {
  const [isEditingIncome, setIsEditingIncome] = React.useState(false);
  const [isEditingOutflow, setIsEditingOutflow] = React.useState(false);

  // State for all financial data, now loading from localStorage
  const [financeData, setFinanceData] = React.useState<FinanceData>(() => {
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

  // Save to localStorage whenever financeData changes
  React.useEffect(() => {
    localStorage.setItem('finance-data', JSON.stringify(financeData));
  }, [financeData]);

  // Export data to text file
  const exportData = () => {
    const dataStr = JSON.stringify(financeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'cashflow.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from file
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as FinanceData;
        setFinanceData(importedData);
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.setItem('finance-data', JSON.stringify(defaultFinanceData));
    showSuccess("Cashflow data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

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
  
  const annualHouseholdExpense = financeData.monthlyHouseholdExpense * 12;
  const annualPpf = financeData.monthlyPpf * 12;
  const annualUlip = financeData.monthlyUlip * 12;
  const annualInsurance = financeData.monthlyInsurance * 12;
  const annualRds = financeData.monthlyRds * 12;
  const annualLoanEMIs = financeData.monthlyLoanEMIs * 12;
  const annualDonation = financeData.monthlyDonation * 12;
  const annualEntertainment = financeData.monthlyEntertainment * 12;
  const annualTravel = financeData.monthlyTravel * 12;
  const annualOthers = financeData.monthlyOthers * 12;

  const totalAnnualCompulsoryInvestments = annualPpf + annualUlip + annualInsurance + annualRds;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cashflow</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all fields on this page to zero. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Yes, clear data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file">
              <Download className="mr-2 h-4 w-4" /> Import Data
              <Input 
                id="import-file" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={importData}
              />
            </Label>
          </Button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      {/* Three Column Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Annual Income Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Annual Income Breakdown</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditingIncome(!isEditingIncome)}>
              {isEditingIncome ? "Save" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditingIncome ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="postTaxSalaryIncome">Post-Tax Salary Income:</Label>
                  <Input
                    id="postTaxSalaryIncome"
                    type="number"
                    value={financeData.postTaxSalaryIncome}
                    onChange={(e) => setFinanceData({...financeData, postTaxSalaryIncome: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="businessIncome">Business Income:</Label>
                  <Input
                    id="businessIncome"
                    type="number"
                    value={financeData.businessIncome}
                    onChange={(e) => setFinanceData({...financeData, businessIncome: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rentalProperty1">Rental Income (Property 1):</Label>
                  <Input
                    id="rentalProperty1"
                    type="number"
                    value={financeData.rentalProperty1}
                    onChange={(e) => setFinanceData({...financeData, rentalProperty1: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rentalProperty2">Rental Income (Property 2):</Label>
                  <Input
                    id="rentalProperty2"
                    type="number"
                    value={financeData.rentalProperty2}
                    onChange={(e) => setFinanceData({...financeData, rentalProperty2: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rentalProperty3">Rental Income (Property 3):</Label>
                  <Input
                    id="rentalProperty3"
                    type="number"
                    value={financeData.rentalProperty3}
                    onChange={(e) => setFinanceData({...financeData, rentalProperty3: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fdInterest">FD Interests:</Label>
                  <Input
                    id="fdInterest"
                    type="number"
                    value={financeData.fdInterest}
                    onChange={(e) => setFinanceData({...financeData, fdInterest: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bondIncome">Bond Incomes:</Label>
                  <Input
                    id="bondIncome"
                    type="number"
                    value={financeData.bondIncome}
                    onChange={(e) => setFinanceData({...financeData, bondIncome: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dividendIncome">Dividend Income:</Label>
                  <Input
                    id="dividendIncome"
                    type="number"
                    value={financeData.dividendIncome}
                    onChange={(e) => setFinanceData({...financeData, dividendIncome: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Post-Tax Salary Income:</span>
                  <span className="font-medium">₹{financeData.postTaxSalaryIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business Income:</span>
                  <span className="font-medium">₹{financeData.businessIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rental Income (3 Properties):</span>
                  <span className="font-medium">₹{totalRentalIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>FD Interests:</span>
                  <span className="font-medium">₹{financeData.fdInterest.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bond Incomes:</span>
                  <span className="font-medium">₹{financeData.bondIncome.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dividend Income:</span>
                  <span className="font-medium">₹{financeData.dividendIncome.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Outflow Column */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Outflow Breakdown</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditingOutflow(!isEditingOutflow)}>
              {isEditingOutflow ? "Save" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditingOutflow ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="monthlyHouseholdExpense">Household Expense:</Label>
                  <Input
                    id="monthlyHouseholdExpense"
                    type="number"
                    value={financeData.monthlyHouseholdExpense}
                    onChange={(e) => setFinanceData({...financeData, monthlyHouseholdExpense: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyPpf">PPF Investment:</Label>
                  <Input
                    id="monthlyPpf"
                    type="number"
                    value={financeData.monthlyPpf}
                    onChange={(e) => setFinanceData({...financeData, monthlyPpf: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyUlip">ULIP Investment:</Label>
                  <Input
                    id="monthlyUlip"
                    type="number"
                    value={financeData.monthlyUlip}
                    onChange={(e) => setFinanceData({...financeData, monthlyUlip: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyInsurance">Insurance Premium:</Label>
                  <Input
                    id="monthlyInsurance"
                    type="number"
                    value={financeData.monthlyInsurance}
                    onChange={(e) => setFinanceData({...financeData, monthlyInsurance: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyRds">RDs Investment:</Label>
                  <Input
                    id="monthlyRds"
                    type="number"
                    value={financeData.monthlyRds}
                    onChange={(e) => setFinanceData({...financeData, monthlyRds: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyLoanEMIs">Loan EMIs:</Label>
                  <Input
                    id="monthlyLoanEMIs"
                    type="number"
                    value={financeData.monthlyLoanEMIs}
                    onChange={(e) => setFinanceData({...financeData, monthlyLoanEMIs: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyDonation">Donation:</Label>
                  <Input
                    id="monthlyDonation"
                    type="number"
                    value={financeData.monthlyDonation}
                    onChange={(e) => setFinanceData({...financeData, monthlyDonation: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyEntertainment">Entertainment:</Label>
                  <Input
                    id="monthlyEntertainment"
                    type="number"
                    value={financeData.monthlyEntertainment}
                    onChange={(e) => setFinanceData({...financeData, monthlyEntertainment: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyTravel">Travel:</Label>
                  <Input
                    id="monthlyTravel"
                    type="number"
                    value={financeData.monthlyTravel}
                    onChange={(e) => setFinanceData({...financeData, monthlyTravel: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyOthers">Others:</Label>
                  <Input
                    id="monthlyOthers"
                    type="number"
                    value={financeData.monthlyOthers}
                    onChange={(e) => setFinanceData({...financeData, monthlyOthers: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Household Expense:</span>
                  <span className="font-medium">₹{financeData.monthlyHouseholdExpense.toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compulsory Investments:</span>
                  <span className="font-medium">₹{(financeData.monthlyPpf + financeData.monthlyUlip + financeData.monthlyInsurance + financeData.monthlyRds).toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan EMIs:</span>
                  <span className="font-medium">₹{financeData.monthlyLoanEMIs.toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entertainment:</span>
                  <span className="font-medium">₹{financeData.monthlyEntertainment.toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel:</span>
                  <span className="font-medium">₹{financeData.monthlyTravel.toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Others:</span>
                  <span className="font-medium">₹{financeData.monthlyOthers.toLocaleString("en-IN", {maximumFractionDigits: 2})}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Annual Outflow Column */}
        <Card>
          <CardHeader>
            <CardTitle>Annual Outflow Projections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Household Expense:</span>
                <span className="font-medium">₹{annualHouseholdExpense.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Compulsory Investments:</span>
                <span className="font-medium">₹{totalAnnualCompulsoryInvestments.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Loan EMIs:</span>
                <span className="font-medium">₹{annualLoanEMIs.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Entertainment:</span>
                <span className="font-medium">₹{annualEntertainment.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Travel:</span>
                <span className="font-medium">₹{annualTravel.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Others:</span>
                <span className="font-medium">₹{annualOthers.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashflow;