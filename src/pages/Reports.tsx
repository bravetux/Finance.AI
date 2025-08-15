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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ReportFormat = "json" | "txt";

const safeJSONParse = (key: string, defaultValue: any = {}) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse JSON for key: ${key}`, e);
    return defaultValue;
  }
};

const Reports: React.FC = () => {
  const [format, setFormat] = useState<ReportFormat>("json");

  const gatherAllData = () => {
    try {
      const allData = {
        // Planning
        cashflow: safeJSONParse('finance-data', {}),
        netWorth: safeJSONParse('netWorthData', {}),
        goals: safeJSONParse('goalsData', []),
        expensePlanner: safeJSONParse('expenseTrackerData', []),
        
        // Retirement
        retirementDashboard: safeJSONParse('retirementData', {}),
        fireCalculator: safeJSONParse('fireCalculatorData', {}),
        canYouRetireNow: safeJSONParse('canRetireNowData', {}),
        projectedCashflow: {
          settings: safeJSONParse('projectedCashflowSettings', {}),
          corpus: safeJSONParse('projectedAccumulatedCorpus', 0),
        },
        postRetirementStrategy: {
          settings: safeJSONParse('postRetirementStrategyPageSettings', {}),
        },
        futureValueCalculator: safeJSONParse('future-value-data', []),

        // Assets
        assets: {
          realEstate: {
            properties: safeJSONParse('realEstatePropertyValues', []),
            rentals: safeJSONParse('realEstateRentalProperties', []),
            reit: safeJSONParse('realEstateReitValue', 0),
          },
          equity: {
            domesticStocks: safeJSONParse('domesticEquityStocks', []),
            usEquity: safeJSONParse('usEquityData', []),
          },
          funds: {
            mutualFundAllocation: safeJSONParse('mutualFundAllocationEntries', []),
            mutualFundSips: safeJSONParse('mutualFundSIPEntries', []),
            sipOutflow: safeJSONParse('sipOutflowData', 0),
            smallCases: safeJSONParse('smallCaseData', []),
          },
          debt: {
            liquid: safeJSONParse('debtLiquidAssets', []),
            fixedDeposits: safeJSONParse('debtFixedDeposits', []),
            debtFunds: safeJSONParse('debtDebtFunds', []),
            govInvestments: safeJSONParse('debtGovInvestments', []),
          },
          preciousMetals: {
            gold: safeJSONParse('goldData', []),
            silver: safeJSONParse('silverData', []),
            platinum: safeJSONParse('platinumData', []),
            diamond: safeJSONParse('diamondData', []),
          },
        },
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (typeof data !== 'object' || data === null || !data.cashflow) {
          throw new Error("Invalid or corrupted data file.");
        }

        // Clear existing data before importing to prevent merge issues
        localStorage.clear();

        // Restore data from the imported file
        if (data.cashflow) localStorage.setItem('finance-data', JSON.stringify(data.cashflow));
        if (data.netWorth) localStorage.setItem('netWorthData', JSON.stringify(data.netWorth));
        if (data.goals) localStorage.setItem('goalsData', JSON.stringify(data.goals));
        if (data.expensePlanner) localStorage.setItem('expenseTrackerData', JSON.stringify(data.expensePlanner));
        if (data.retirementDashboard) localStorage.setItem('retirementData', JSON.stringify(data.retirementDashboard));
        if (data.fireCalculator) localStorage.setItem('fireCalculatorData', JSON.stringify(data.fireCalculator));
        if (data.canYouRetireNow) localStorage.setItem('canRetireNowData', JSON.stringify(data.canYouRetireNow));
        if (data.projectedCashflow?.settings) localStorage.setItem('projectedCashflowSettings', JSON.stringify(data.projectedCashflow.settings));
        if (data.projectedCashflow?.corpus) localStorage.setItem('projectedAccumulatedCorpus', JSON.stringify(data.projectedCashflow.corpus));
        if (data.postRetirementStrategy?.settings) localStorage.setItem('postRetirementStrategyPageSettings', JSON.stringify(data.postRetirementStrategy.settings));
        if (data.futureValueCalculator) localStorage.setItem('future-value-data', JSON.stringify(data.futureValueCalculator));
        if (data.assets?.realEstate?.properties) localStorage.setItem('realEstatePropertyValues', JSON.stringify(data.assets.realEstate.properties));
        if (data.assets?.realEstate?.rentals) localStorage.setItem('realEstateRentalProperties', JSON.stringify(data.assets.realEstate.rentals));
        if (data.assets?.realEstate?.reit) localStorage.setItem('realEstateReitValue', JSON.stringify(data.assets.realEstate.reit));
        if (data.assets?.equity?.domesticStocks) localStorage.setItem('domesticEquityStocks', JSON.stringify(data.assets.equity.domesticStocks));
        if (data.assets?.equity?.usEquity) localStorage.setItem('usEquityData', JSON.stringify(data.assets.equity.usEquity));
        if (data.assets?.funds?.mutualFundAllocation) localStorage.setItem('mutualFundAllocationEntries', JSON.stringify(data.assets.funds.mutualFundAllocation));
        if (data.assets?.funds?.mutualFundSips) localStorage.setItem('mutualFundSIPEntries', JSON.stringify(data.assets.funds.mutualFundSips));
        if (data.assets?.funds?.sipOutflow) localStorage.setItem('sipOutflowData', JSON.stringify(data.assets.funds.sipOutflow));
        if (data.assets?.funds?.smallCases) localStorage.setItem('smallCaseData', JSON.stringify(data.assets.funds.smallCases));
        if (data.assets?.debt?.liquid) localStorage.setItem('debtLiquidAssets', JSON.stringify(data.assets.debt.liquid));
        if (data.assets?.debt?.fixedDeposits) localStorage.setItem('debtFixedDeposits', JSON.stringify(data.assets.debt.fixedDeposits));
        if (data.assets?.debt?.debtFunds) localStorage.setItem('debtDebtFunds', JSON.stringify(data.assets.debt.debtFunds));
        if (data.assets?.debt?.govInvestments) localStorage.setItem('debtGovInvestments', JSON.stringify(data.assets.debt.govInvestments));
        if (data.assets?.preciousMetals?.gold) localStorage.setItem('goldData', JSON.stringify(data.assets.preciousMetals.gold));
        if (data.assets?.preciousMetals?.silver) localStorage.setItem('silverData', JSON.stringify(data.assets.preciousMetals.silver));
        if (data.assets?.preciousMetals?.platinum) localStorage.setItem('platinumData', JSON.stringify(data.assets.preciousMetals.platinum));
        if (data.assets?.preciousMetals?.diamond) localStorage.setItem('diamondData', JSON.stringify(data.assets.preciousMetals.diamond));

        showSuccess("Data imported successfully! The application will now reload.");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error: any) {
        showError(`Failed to import data: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    const keysToClear = [
      // Planning
      'finance-data',
      'netWorthData',
      'goalsData',
      'expenseTrackerData',
      // Retirement
      'retirementData',
      'fireCalculatorData',
      'canRetireNowData',
      'projectedCashflowSettings',
      'projectedAccumulatedCorpus',
      'postRetirementStrategyPageSettings',
      'future-value-data',
      // Assets
      'realEstatePropertyValues',
      'realEstateReitValue',
      'realEstateRentalProperties',
      'domesticEquityStocks',
      'usEquityData',
      'mutualFundAllocationEntries',
      'mutualFundSIPEntries',
      'sipOutflowData',
      'smallCaseData',
      'debtLiquidAssets',
      'debtFixedDeposits',
      'debtDebtFunds',
      'debtGovInvestments',
      'goldData',
      'silverData',
      'platinumData',
      'diamondData',
    ];

    keysToClear.forEach(key => localStorage.removeItem(key));

    showSuccess("All application data has been reset to default values.");

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
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" /> Import Data
              <Input 
                id="import-file" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImport}
              />
            </Label>
          </Button>
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