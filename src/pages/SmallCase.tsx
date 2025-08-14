"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Briefcase, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FundCategory = 'Largecap' | 'Midcap' | 'Smallcap' | 'Flexi/Multi cap' | 'Not Assigned';

interface SmallCaseEntry {
  id: string;
  fundName: string;
  category: FundCategory;
  currentValue: number;
}

const initialSmallCaseEntries: SmallCaseEntry[] = [];

const SmallCase: React.FC = () => {
  const [smallCaseEntries, setSmallCaseEntries] = useState<SmallCaseEntry[]>(() => {
    try {
      const saved = localStorage.getItem('smallCaseData');
      return saved ? JSON.parse(saved) : initialSmallCaseEntries;
    } catch {
      return initialSmallCaseEntries;
    }
  });

  useEffect(() => {
    localStorage.setItem('smallCaseData', JSON.stringify(smallCaseEntries));
  }, [smallCaseEntries]);

  const handleAddRow = () => {
    const newEntry: SmallCaseEntry = {
      id: Date.now().toString(),
      fundName: '',
      category: 'Not Assigned',
      currentValue: 0,
    };
    setSmallCaseEntries(prev => [...prev, newEntry]);
  };

  const handleDeleteRow = (id: string) => {
    setSmallCaseEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleEntryChange = (id: string, field: keyof SmallCaseEntry, value: string | number) => {
    setSmallCaseEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const categoryAllocation = useMemo(() => {
    const allocation: { [key in FundCategory]: number } = {
      Largecap: 0,
      Midcap: 0,
      Smallcap: 0,
      'Flexi/Multi cap': 0,
      'Not Assigned': 0,
    };

    smallCaseEntries.forEach(entry => {
      allocation[entry.category] += entry.currentValue;
    });

    const totalValue = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    
    const chartData = Object.entries(allocation)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
    
    const allocationWithContribution = Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      contribution: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));

    return { allocationWithContribution, totalValue, chartData };
  }, [smallCaseEntries]);

  useEffect(() => {
    try {
      const savedNetWorthData = localStorage.getItem('netWorthData');
      const netWorthData = savedNetWorthData ? JSON.parse(savedNetWorthData) : {};
      
      const updatedNetWorthData = {
        ...netWorthData,
        smallCases: categoryAllocation.totalValue,
      };

      localStorage.setItem('netWorthData', JSON.stringify(updatedNetWorthData));
    } catch (error) {
      console.error("Failed to update net worth data from Small Case page:", error);
    }
  }, [categoryAllocation.totalValue]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(smallCaseEntries, null, 2)], { type: 'application/json' });
    saveAs(blob, 'small-case-data.json');
    showSuccess('Small Case data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'fundName' in item && 'category' in item && 'currentValue' in item)) {
          setSmallCaseEntries(data);
          showSuccess('Data imported successfully!');
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
    setSmallCaseEntries([]);
    showSuccess('All Small Case data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          Small Case
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Small Case Holdings</CardTitle>
            <CardDescription>Add and categorize your individual Small Case holdings.</CardDescription>
          </div>
          <Button onClick={handleAddRow}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[3%] py-1 px-1">S.No</TableHead>
                  <TableHead className="py-1 px-1">Small Case Name</TableHead>
                  <TableHead className="py-1 px-1">Category</TableHead>
                  <TableHead className="py-1 px-1">Current Value (INR)</TableHead>
                  <TableHead className="text-right py-1 px-1">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smallCaseEntries.length > 0 ? smallCaseEntries.map((entry, index) => (
                  <TableRow key={entry.id} className="h-9">
                    <TableCell className="py-0 px-1 align-middle text-xs">{index + 1}</TableCell>
                    <TableCell className="p-0">
                      <Input
                        value={entry.fundName}
                        onChange={e => handleEntryChange(entry.id, 'fundName', e.target.value)}
                        placeholder="Enter name"
                        className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <Select
                        value={entry.category}
                        onValueChange={(value: FundCategory) => handleEntryChange(entry.id, 'category', value)}
                      >
                        <SelectTrigger className="bg-transparent border-0 focus:ring-0 h-7 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Largecap">Largecap</SelectItem>
                          <SelectItem value="Midcap">Midcap</SelectItem>
                          <SelectItem value="Smallcap">Smallcap</SelectItem>
                          <SelectItem value="Flexi/Multi cap">Flexi/Multi cap</SelectItem>
                          <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-0">
                      <Input
                        type="text"
                        value={entry.currentValue.toLocaleString('en-IN')}
                        onChange={e => {
                          const numericValue = Number(e.target.value.replace(/,/g, ''));
                          if (!isNaN(numericValue)) {
                            handleEntryChange(entry.id, 'currentValue', numericValue);
                          }
                        }}
                        className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm"
                      />
                    </TableCell>
                    <TableCell className="text-right py-0 px-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(entry.id)} className="h-7 w-7">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-20 text-muted-foreground text-sm">
                      No entries added yet. Click "Add Entry" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={3} className="py-1 px-1 text-sm">Total Current Value</TableCell>
                  <TableCell className="text-right py-1 px-1 text-sm">{formatCurrency(categoryAllocation.totalValue)}</TableCell>
                  <TableCell className="py-1 px-1" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Allocation Summary</CardTitle>
          <CardDescription>A summary of your Small Case portfolio based on category.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResizablePanelGroup direction="horizontal" className="min-h-[300px] w-full">
            <ResizablePanel defaultSize={50}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-1 px-1">Category</TableHead>
                    <TableHead className="text-right py-1 px-1">Value (INR)</TableHead>
                    <TableHead className="text-right py-1 px-1">Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryAllocation.allocationWithContribution.map(item => (
                    <TableRow key={item.name} className="h-9">
                      <TableCell className="font-medium py-0 px-1 text-sm">{item.name}</TableCell>
                      <TableCell className="text-right py-0 px-1 text-sm">{formatCurrency(item.value)}</TableCell>
                      <TableCell className="text-right py-0 px-1 text-sm">{item.contribution.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell className="py-1 px-1 text-sm">Total</TableCell>
                    <TableCell className="font-bold text-right py-1 px-1 text-sm">{formatCurrency(categoryAllocation.totalValue)}</TableCell>
                    <TableCell className="font-bold text-right py-1 px-1 text-sm">100.00%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <GenericPieChart data={categoryAllocation.chartData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmallCase;