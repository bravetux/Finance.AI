"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { saveAs } from 'file-saver';

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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Generate Reports
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
    </div>
  );
};

export default Reports;