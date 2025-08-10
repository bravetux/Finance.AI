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

interface EquityData {
  id: string;
  name: 'Largecap' | 'Midcap' | 'Smallcap';
  value: number;
}

const initialData: EquityData[] = [
  { id: 'large', name: 'Largecap', value: 11475843 },
  { id: 'mid', name: 'Midcap', value: 4120442 },
  { id: 'small', name: 'Smallcap', value: 3602340 },
];

const DomesticEquity: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [equityData, setEquityData] = useState<EquityData[]>(() => {
    try {
      const saved = localStorage.getItem('domesticEquityData');
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  useEffect(() => {
    localStorage.setItem('domesticEquityData', JSON.stringify(equityData));
  }, [equityData]);

  const handleValueChange = (id: string, value: string) => {
    if (value.length > 10) return;
    setEquityData(prev =>
      prev.map(item => (item.id === id ? { ...item, value: Number(value) || 0 } : item))
    );
  };

  const calculations = useMemo(() => {
    const totalValue = equityData.reduce((sum, item) => sum + item.value, 0);
    const dataWithContribution = equityData.map(item => ({
      ...item,
      contribution: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));
    return { totalValue, dataWithContribution };
  }, [equityData]);

  const chartData = useMemo(() => {
    return calculations.dataWithContribution
      .filter(item => item.value > 0)
      .map(item => ({
        name: item.name,
        value: item.value,
      }));
  }, [calculations.dataWithContribution]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(equityData, null, 2)], { type: 'application/json' });
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
        if (Array.isArray(data) && data.every(item => 'id' in item && 'name' in item && 'value' in item)) {
          setEquityData(data);
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
    setEquityData(initialData);
    showSuccess('Domestic Equity data has been reset.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart2 className="h-8 w-8" />
          Domestic Equity
        </h1>
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
                  This will reset all data on this page to its default state. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <><Save className="mr-2 h-4 w-4" /> Save</>
            ) : (
              <><Edit className="mr-2 h-4 w-4" /> Edit</>
            )}
          </Button>
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

      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[300px] w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Market Cap Allocation</CardTitle>
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
                  {calculations.dataWithContribution.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="p-1 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.value}
                            onChange={e => handleValueChange(item.id, e.target.value)}
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
                    <TableCell className="font-bold text-right">{formatCurrency(calculations.totalValue)}</TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Allocation Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={chartData} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DomesticEquity;