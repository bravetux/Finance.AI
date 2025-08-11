"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Trash2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { saveAs } from 'file-saver';
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

type ReportFormat = "json" | "txt";

const Reports: React.FC = () => {
  const [format, setFormat] = useState<ReportFormat>("json");

  const gatherAllData = () => {
    try {
      const allData = {
        dashboard: {
          cashflow: JSON.parse(localStorage.getItem('finance-data') || '{}'),
          netWorth: JSON.parse(localStorage.getItem('netWorthData') || '{}'),
          futureValue: JSON.parse(localStorage.getItem('future-value-data') || '[]'),
          goals: JSON.parse(localStorage.getItem('goalsData') || '[]'),
          retirement: JSON.parse(localStorage.getItem('retirementData') || '{}'),
          projectedCashflow: {
            settings: JSON.parse(localStorage.getItem('projectedCashflowSettings') || '{}'),
            corpus: JSON.parse(localStorage.getItem('projectedAccumulatedCorpus') || '0'),
          }
        },
        cashflow: JSON.parse(localStorage.getItem('finance-data') || '{}'),
        netWorth: JSON.parse(localStorage.getItem('netWorthData') || '{}'),
        futureValue: JSON.parse(localStorage.getItem('future-value-data') || '[]'),
        goals: JSON.parse(localStorage.getItem('goalsData') || '[]'),
        retirement: JSON.parse(localStorage.getItem('retirementData') || '{}'),
        projectedCashflow: {
          settings: JSON.parse(localStorage.getItem('projectedCashflowSettings') || '{}'),
          corpus: JSON.parse(localStorage.getItem('projectedAccumulatedCorpus') || '0'),
        }
      };
      return allData;
    } catch (e) {
      showError("Failed to gather data from storage. Some data might be corrupt.");
      return null;
    }
  };

  const getFormattedTimestamp = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
    const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    return `${date}_${time}`;
  };

  const generateReport = async () => {
    const data = gatherAllData();
    if (!data) return;

    const timestamp = getFormattedTimestamp();
    const filename = `Report_${timestamp}.${format}`;

    try {
      switch (format) {
        case "json":
          generateJson(data, filename);
          break;
        case "txt":
          generateTxt(data, filename);
          break;
      }
      showSuccess(`Successfully generated ${filename}`);
    } catch (error) {
      showError(`Failed to generate ${format.toUpperCase()} report.`);
      console.error("Report generation error:", error);
    }
  };

  const downloadFile = (content: string | Blob, filename: string, contentType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
    saveAs(blob, filename);
  };

  const generateJson = (data: object, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, filename, "application/json");
  };

  const generateTxt = (data: object, filename: string) => {
    const txtString = JSON.stringify(data, null, 2); // Simple stringify for TXT
    downloadFile(txtString, filename, "text/plain");
  };

  const handleReset = () => {
    const zeroedFinanceData = {
      postTaxSalaryIncome: 0, businessIncome: 0,
      rentalProperty1: 0, rentalProperty2: 0, rentalProperty3: 0,
      fdInterest: 0, bondIncome: 0, dividendIncome: 0,
      monthlyHouseholdExpense: 0, monthlyPpf: 0, monthlyUlip: 0,
      monthlyInsurance: 0, monthlyRds: 0, monthlyLoanEMIs: 0,
      monthlyDonation: 0, monthlyEntertainment: 0, monthlyTravel: 0,
      monthlyOthers: 0
    };
    const zeroedNetWorthData = {
      homeValue: 0, otherRealEstate: 0, jewellery: 0, sovereignGoldBonds: 0,
      ulipsSurrenderValue: 0, epfPpfVpf: 0, fixedDeposits: 0, debtFunds: 0,
      domesticStocks: 0, domesticMutualFunds: 0, internationalFunds: 0,
      smallCases: 0, savingsBalance: 0, goldEtf: 0, cryptocurrency: 0,
      reits: 0, homeLoan: 0, educationLoan: 0, carLoan: 0, personalLoan: 0,
      creditCardDues: 0, otherLiabilities: 0
    };
    const zeroedRetirementData = {
      currentAge: 0,
      retirementAge: 0,
      lifeExpectancy: 100,
      currentAnnualExpenses: 0,
      inflation: 6,
      allocations: { equity: 50, fds: 25, bonds: 20, cash: 5 },
      returns: { equity: 12, fds: 7, bonds: 8, cash: 2.5 },
    };

    localStorage.setItem('finance-data', JSON.stringify(zeroedFinanceData));
    localStorage.setItem('netWorthData', JSON.stringify(zeroedNetWorthData));
    localStorage.setItem('retirementData', JSON.stringify(zeroedRetirementData));

    const keysToRemove = [
      'future-value-data', 'goalsData', 'projectedCashflowSettings',
      'projectedAccumulatedCorpus', 'portfolioData', 'expenseTrackerData',
      'usEquityData', 'realEstatePropertyValues', 'realEstateRentalProperties',
      'domesticEquityStocks', 'mutualFundAllocationEntries', 'mutualFundSIPEntries',
      'goldData', 'debtLiquidAssets', 'debtFixedDeposits', 'debtDebtFunds', 'debtGovInvestments',
      'sipOutflowData'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    showSuccess("All application data has been reset.");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearLocalStorage = () => {
    localStorage.clear();
    showSuccess("All application data has been cleared from local storage.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Reports & Data Management
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consolidated Financial Report</CardTitle>
          <CardDescription>
            Generate a complete report of all your financial data from across the application in your desired format.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto flex-grow">
            <label htmlFor="format-select" className="sr-only">Report Format</label>
            <Select onValueChange={(value: ReportFormat) => setFormat(value)} value={format}>
              <SelectTrigger id="format-select">
                <SelectValue placeholder="Select a format..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="txt">Text (.txt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Use these options to manage your application data. These actions are irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Reset All App Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will reset all your financial data to default (or zeroed) values across the entire application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-800 hover:bg-red-900">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Browser Storage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>DANGER: Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will completely wipe ALL data for this application from your browser, including settings and themes. This is a hard reset and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLocalStorage}>
                  Yes, clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;