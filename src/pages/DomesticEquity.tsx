"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart2, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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

// New interface for individual stocks
interface Stock {
  id: string;
  stockName: string;
  category: 'Largecap' | 'Midcap' | 'Smallcap' | 'Not Assigned';
  currentValue: number;
}

const initialStocks: Stock[] = [
  { id: '1', stockName: 'RELIANCE INDUSTRIES', category: 'Largecap', currentValue: 500000 },
  { id: '2', stockName: 'TATA CONSULTANCY', category: 'Largecap', currentValue: 450000 },
  { id: '3', stockName: 'TRENT', category: 'Midcap', currentValue: 200000 },
  { id: '4', stockName: 'KEI INDUSTRIES', category: 'Smallcap', currentValue: 150000 },
];

const DomesticEquity: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>(() => {
    try {
      const saved = localStorage.getItem('domesticEquityStocks');
      return saved ? JSON.parse(saved) : initialStocks;
    } catch {
      return initialStocks;
    }
  });

  useEffect(() => {
    localStorage.setItem('domesticEquityStocks', JSON.stringify(stocks));
  }, [stocks]);

  const handleAddRow = () => {
    const newStock: Stock = {
      id: Date.now().toString(),
      stockName: '',
      category: 'Not Assigned',
      currentValue: 0,
    };
    setStocks(prev => [...prev, newStock]);
  };

  const handleDeleteRow = (id: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== id));
  };

  const handleStockChange = (id: string, field: keyof Stock, value: string | number) => {
    setStocks(prev =>
      prev.map(stock => (stock.id === id ? { ...stock, [field]: value } : stock))
    );
  };

  const marketCapAllocation = useMemo(() => {
    const allocation: { [key in 'Largecap' | 'Midcap' | 'Smallcap']: number } = {
      Largecap: 0,
      Midcap: 0,
      Smallcap: 0,
    };

    stocks.forEach(stock => {
      if (stock.category !== 'Not Assigned') {
        allocation[stock.category] += stock.currentValue;
      }
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
  }, [stocks]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(stocks, null, 2)], { type: 'application/json' });
    saveAs(blob, 'domestic-equity-stocks.json');
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
        if (Array.isArray(data) && data.every(item => 'id' in item && 'stockName' in item && 'category' in item && 'currentValue' in item)) {
          setStocks(data);
          showSuccess('Stock data imported successfully!');
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
    setStocks([]);
    showSuccess('All stock data has been cleared.');
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
                  This will delete all stock entries on this page. This action cannot be undone.
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
            <CardTitle>Stock Holdings</CardTitle>
            <CardDescription>Add and categorize your individual stock holdings.</CardDescription>
          </div>
          <Button onClick={handleAddRow}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Stock
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%]">S.No</TableHead>
                  <TableHead>Stock Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Value (INR)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.length > 0 ? stocks.map((stock, index) => (
                  <TableRow key={stock.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={stock.stockName}
                        onChange={e => handleStockChange(stock.id, 'stockName', e.target.value)}
                        placeholder="Enter stock name"
                        className="bg-transparent"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={stock.category}
                        onValueChange={(value: Stock['category']) => handleStockChange(stock.id, 'category', value)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Largecap">Largecap</SelectItem>
                          <SelectItem value="Midcap">Midcap</SelectItem>
                          <SelectItem value="Smallcap">Smallcap</SelectItem>
                          <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={stock.currentValue}
                        onChange={e => handleStockChange(stock.id, 'currentValue', Number(e.target.value))}
                        className="bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(stock.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No stocks added yet. Click "Add Stock" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Cap Summary</CardTitle>
          <CardDescription>A summary of your portfolio based on market capitalization.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResizablePanelGroup direction="horizontal" className="min-h-[300px] w-full">
            <ResizablePanel defaultSize={50}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Value (INR)</TableHead>
                    <TableHead className="text-right">Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketCapAllocation.allocationWithContribution.map(item => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                      <TableCell className="text-right">{item.contribution.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold text-right">{formatCurrency(marketCapAllocation.totalValue)}</TableCell>
                    <TableCell className="font-bold text-right">100.00%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <GenericPieChart data={marketCapAllocation.chartData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomesticEquity;