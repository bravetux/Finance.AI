"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart2, Upload, Download, Trash2, Edit, Save } from "lucide-react";
import { saveAs } from "file-saver";
import { showSuccess, showError } from "@/utils/toast";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import GenericPieChart from "@/components/GenericPieChart";

// Equity Data
interface EquityData {
  id: string;
  name: 'Largecap' | 'Midcap' | 'Smallcap';
  value: number;
}

const initialEquityData: EquityData[] = [
  { id: 'large', name: 'Largecap', value: 11475843 },
  { id: 'mid', name: 'Midcap', value: 4120442 },
  { id: 'small', name: 'Smallcap', value: 3602340 },
];

// Mutual Fund Data
interface MutualFundData {
  id: string;
  name: 'Largecap' | 'Midcap' | 'Smallcap' | 'Flexi/Multi cap';
  value: number;
}

const initialMutualFundData: MutualFundData[] = [
  { id: 'mf-large', name: 'Largecap', value: 270230 },
  { id: 'mf-mid', name: 'Midcap', value: 2300 },
  { id: 'mf-small', name: 'Smallcap', value: 6140 },
  { id: 'mf-flexi', name: 'Flexi/Multi cap', value: 12377 },
];


const DomesticEquity: React.FC = () => {
  // State for editing
  const [isEquityEditing, setIsEquityEditing] = useState(false);
  const [isMutualFundEditing, setIsMutualFundEditing] = useState(false);

  // State for equity data
  const [equityData, setEquityData] = useState<EquityData[]>(() => {
    try {
      const saved = localStorage.getItem('domesticEquityData');
      return saved ? JSON.parse(saved) : initialEquityData;
    } catch {
      return initialEquityData;
    }
  });

  // State for mutual fund data
  const [mutualFundData, setMutualFundData] = useState<MutualFundData[]>(() => {
    try {
      const saved = localStorage.getItem('domesticMutualFundData');
      return saved ? JSON.parse(saved) : initialMutualFundData;
    } catch {
      return initialMutualFundData;
    }
  });

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('domesticEquityData', JSON.stringify(equityData));
  }, [equityData]);

  useEffect(() => {
    localStorage.setItem('domesticMutualFundData', JSON.stringify(mutualFundData));
  }, [mutualFundData]);

  // Handlers for input changes
  const handleEquityValueChange = (id: string, value: string) => {
    if (value.length > 10) return;
    setEquityData(prev =>
      prev.map(item => (item.id === id ? { ...item, value: Number(value) || 0 } : item))
    );
  };

  const handleMutualFundValueChange = (id: string, value: string) => {
    if (value.length > 10) return;
    setMutualFundData(prev =>
      prev.map(item => (item.id === id ? { ...item, value: Number(value) || 0 } : item))
    );
  };

  // Calculations for equity
  const equityCalculations = useMemo(() => {
    const totalValue = equityData.reduce((sum, item) => sum + item.value, 0);
    const dataWithContribution = equityData.map(item => ({
      ...item,
      contribution: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));
    return { totalValue, dataWithContribution };
  }, [equityData]);

  // Calculations for mutual funds
  const mutualFundCalculations = useMemo(() => {
    const totalValue = mutualFundData.reduce((sum, item) => sum + item.value, 0);
    const dataWithContribution = mutualFundData.map(item => ({
      ...item,
      contribution: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));
    return { totalValue, dataWithContribution };
  }, [mutualFundData]);

  // Chart data
  const equityChartData = useMemo(() => {
    return equityCalculations.dataWithContribution
      .filter(item => item.value > 0)
      .map(item => ({
        name: item.name,
        value: item.value,
      }));
  }, [equityCalculations.dataWithContribution]);

  const mutualFundChartData = useMemo(() => {
    return mutualFundCalculations.dataWithContribution
      .filter(item => item.value > 0)
      .map(item => ({
        name: item.name,
        value: item.value,
      }));
  }, [mutualFundCalculations.dataWithContribution]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  // Data management
  const exportData = () => {
    const dataToExport = {
      equityData,
      mutualFundData,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    saveAs(blob, 'domestic-equity-data.json');
    showSuccess('Domestic Equity data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.equityData && data.mutualFundData) {
          setEquityData(data.equityData);
          setMutualFundData(data.mutualFundData);
          showSuccess('Domestic Equity data imported successfully!');
        } else {
          showError('Invalid file format.');
        }
      } catch (err) {
        showError('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    setEquityData(initialEquityData);
    setMutualFundData(initialMutualFundData);
    showSuccess('Domestic Equity data has been reset.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart2 className="h-8 w-8" />
          Domestic Equity
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all data on this page to its default state. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" /> Import
              <Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} />
            </Label>
          </Button>
        </div>
      </div>

      {/* Equity Allocation Section */}
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[300px] w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={60}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Market Cap Allocation</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEquityEditing(!isEquityEditing)}>
                {isEquityEditing ? (
                  <><Save className="mr-2 h-4 w-4" /> Save</>
                ) : (
                  <><Edit className="mr-2 h-4 w-4" /> Edit</>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company size</TableHead>
                    <TableHead className="text-right">Current value (INR)</TableHead>
                    <TableHead className="text-right">Contribution %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equityCalculations.dataWithContribution.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="p-1 text-right">
                        {isEquityEditing ? (
                          <Input
                            type="number"
                            value={item.value}
                            onChange={e => handleEquityValueChange(item.id, e.target.value)}
                            className="w-full text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                          />
                        ) : (
                          <span className="px-3">{formatCurrency(item.value)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.contribution.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold text-right">{formatCurrency(equityCalculations.totalValue)}</TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Allocation Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={equityChartData} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mutual Fund Components Section */}
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[300px] w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={60}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mutual Fund Components</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsMutualFundEditing(!isMutualFundEditing)}>
                {isMutualFundEditing ? (
                  <><Save className="mr-2 h-4 w-4" /> Save</>
                ) : (
                  <><Edit className="mr-2 h-4 w-4" /> Edit</>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mutual fund components</TableHead>
                    <TableHead className="text-right">Current value (INR)</TableHead>
                    <TableHead className="text-right">Contribution %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutualFundCalculations.dataWithContribution.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="p-1 text-right">
                        {isMutualFundEditing ? (
                          <Input
                            type="number"
                            value={item.value}
                            onChange={e => handleMutualFundValueChange(item.id, e.target.value)}
                            className="w-full text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                          />
                        ) : (
                          <span className="px-3">{formatCurrency(item.value)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.contribution.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold text-right">{formatCurrency(mutualFundCalculations.totalValue)}</TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Mutual Fund Allocation Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={mutualFundChartData} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DomesticEquity;