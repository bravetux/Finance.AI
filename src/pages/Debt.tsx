"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Trash2, PlusCircle, Wallet } from "lucide-react";
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
import GenericPieChart from "@/components/GenericPieChart";

// Interfaces for each section
interface LiquidAsset {
  id: string;
  particulars: string;
  currentValue: number;
}
interface FixedDeposit {
  id: string;
  bankName: string;
  currentValue: number;
}
interface DebtFund {
  id: string;
  name: string;
  currentValue: number;
}
interface GovInvestment {
  id: string;
  name: string;
  currentValue: number;
}

// Initial data is now empty
const initialLiquidAssets: LiquidAsset[] = [];
const initialFixedDeposits: FixedDeposit[] = [];
const initialDebtFunds: DebtFund[] = [];
const initialGovInvestments: GovInvestment[] = [];

const Debt: React.FC = () => {
  const [liquidAssets, setLiquidAssets] = useState<LiquidAsset[]>(() => {
    try { const saved = localStorage.getItem('debtLiquidAssets'); return saved ? JSON.parse(saved) : initialLiquidAssets; } catch { return initialLiquidAssets; }
  });
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>(() => {
    try { const saved = localStorage.getItem('debtFixedDeposits'); return saved ? JSON.parse(saved) : initialFixedDeposits; } catch { return initialFixedDeposits; }
  });
  const [debtFunds, setDebtFunds] = useState<DebtFund[]>(() => {
    try { const saved = localStorage.getItem('debtDebtFunds'); return saved ? JSON.parse(saved) : initialDebtFunds; } catch { return initialDebtFunds; }
  });
  const [govInvestments, setGovInvestments] = useState<GovInvestment[]>(() => {
    try { const saved = localStorage.getItem('debtGovInvestments'); return saved ? JSON.parse(saved) : initialGovInvestments; } catch { return initialGovInvestments; }
  });

  useEffect(() => { localStorage.setItem('debtLiquidAssets', JSON.stringify(liquidAssets)); }, [liquidAssets]);
  useEffect(() => { localStorage.setItem('debtFixedDeposits', JSON.stringify(fixedDeposits)); }, [fixedDeposits]);
  useEffect(() => { localStorage.setItem('debtDebtFunds', JSON.stringify(debtFunds)); }, [debtFunds]);
  useEffect(() => { localStorage.setItem('debtGovInvestments', JSON.stringify(govInvestments)); }, [govInvestments]);

  // Generic handler for adding a new row
  const handleAddRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    newRow: T
  ) => {
    setter(prev => [...prev, newRow]);
  };

  // Specific handler for adding a liquid asset with default text
  const handleAddLiquidAsset = () => {
    const bankSavingsEntries = liquidAssets.filter(asset => 
        asset.particulars.startsWith('Bank Savings xxxx ')
    );
    
    let maxNum = 0;
    bankSavingsEntries.forEach(asset => {
        const numStr = asset.particulars.split(' ').pop();
        const num = numStr ? parseInt(numStr, 10) : 0;
        if (!isNaN(num) && num > maxNum) {
            maxNum = num;
        }
    });

    const nextNumber = maxNum + 1;

    const newRow: LiquidAsset = {
        id: Date.now().toString(),
        particulars: `Bank Savings xxxx ${nextNumber}`,
        currentValue: 0,
    };
    setLiquidAssets(prev => [...prev, newRow]);
  };

  // Generic handler for deleting a row
  const handleDeleteRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string
  ) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  // Generic handler for input changes
  const handleInputChange = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    field: keyof T,
    value: string | number
  ) => {
    setter(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculate totals for each section
  const totalLiquid = useMemo(() => liquidAssets.reduce((sum, a) => sum + a.currentValue, 0), [liquidAssets]);
  const totalFD = useMemo(() => fixedDeposits.reduce((sum, a) => sum + a.currentValue, 0), [fixedDeposits]);
  const totalDebtFunds = useMemo(() => debtFunds.reduce((sum, a) => sum + a.currentValue, 0), [debtFunds]);
  const totalGov = useMemo(() => govInvestments.reduce((sum, a) => sum + a.currentValue, 0), [govInvestments]);

  // Save totalGov to localStorage for NetWorthCalculator
  useEffect(() => {
    try {
      localStorage.setItem('epfPpfVpfTotal', JSON.stringify(totalGov));
      window.dispatchEvent(new Event('storage')); // Notify other tabs/components
    } catch (error) {
      console.error("Failed to save EPF/PPF/VPF total to localStorage:", error);
    }
  }, [totalGov]);

  const totalDebtValue = useMemo(() => totalLiquid + totalFD + totalDebtFunds + totalGov, [totalLiquid, totalFD, totalDebtFunds, totalGov]);

  const pieChartData = useMemo(() => [
    { name: 'Liquid', value: totalLiquid },
    { name: 'Fixed Deposit', value: totalFD },
    { name: 'Debt Funds', value: totalDebtFunds },
    { name: 'Govt. Investments', value: totalGov },
  ], [totalLiquid, totalFD, totalDebtFunds, totalGov]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const dataToExport = {
      liquidAssets,
      fixedDeposits,
      debtFunds,
      govInvestments,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    saveAs(blob, 'debt-data.json');
    showSuccess('Debt data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.liquidAssets && data.fixedDeposits && data.debtFunds && data.govInvestments) {
          setLiquidAssets(data.liquidAssets);
          setFixedDeposits(data.fixedDeposits);
          setDebtFunds(data.debtFunds);
          setGovInvestments(data.govInvestments);
          showSuccess('Debt data imported successfully!');
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
    setLiquidAssets([]);
    setFixedDeposits([]);
    setDebtFunds([]);
    setGovInvestments([]);
    showSuccess("All debt data has been cleared.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Debt
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
                  This will clear all data on this page. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear all</AlertDialogAction>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Debt Asset Value</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalDebtValue)}</div>
          <p className="text-xs text-muted-foreground">
            This is the total value of all your debt and liquid assets.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Debt Allocation</CardTitle>
            </CardHeader>
            <CardContent>
                <GenericPieChart data={pieChartData} />
            </CardContent>
        </Card>
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle>Liquid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalLiquid)}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Fixed Deposit</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalFD)}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Debt Funds</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalDebtFunds)}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Govt. Investments</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalGov)}</p></CardContent></Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liquid Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Liquid</CardTitle>
            <Button size="sm" onClick={handleAddLiquidAsset}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="py-1 px-1">Particulars</TableHead><TableHead className="text-right py-1 px-1">Value</TableHead><TableHead className="w-[10%] py-1 px-1"></TableHead></TableRow></TableHeader>
              <TableBody>
                {liquidAssets.map(item => (
                  <TableRow key={item.id} className="h-9">
                    <TableCell className="p-0"><Input value={item.particulars} onChange={e => handleInputChange(setLiquidAssets, item.id, 'particulars', e.target.value)} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm" /></TableCell>
                    <TableCell className="p-0"><Input type="number" value={item.currentValue} onChange={e => handleInputChange(setLiquidAssets, item.id, 'currentValue', Number(e.target.value))} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm text-right" /></TableCell>
                    <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(setLiquidAssets, item.id)} className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter><TableRow><TableCell className="font-bold py-1 px-1 text-sm">Total</TableCell><TableCell className="text-right font-bold py-1 px-1 text-sm">{formatCurrency(totalLiquid)}</TableCell><TableCell className="py-1 px-1"></TableCell></TableRow></TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Fixed Deposit Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fixed Deposit</CardTitle>
            <Button size="sm" onClick={() => handleAddRow(setFixedDeposits, { id: Date.now().toString(), bankName: '', currentValue: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="py-1 px-1">Bank Name</TableHead><TableHead className="text-right py-1 px-1">Value</TableHead><TableHead className="w-[10%] py-1 px-1"></TableHead></TableRow></TableHeader>
              <TableBody>
                {fixedDeposits.map(item => (
                  <TableRow key={item.id} className="h-9">
                    <TableCell className="p-0"><Input value={item.bankName} onChange={e => handleInputChange(setFixedDeposits, item.id, 'bankName', e.target.value)} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm" /></TableCell>
                    <TableCell className="p-0"><Input type="number" value={item.currentValue} onChange={e => handleInputChange(setFixedDeposits, item.id, 'currentValue', Number(e.target.value))} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm text-right" /></TableCell>
                    <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(setFixedDeposits, item.id)} className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter><TableRow><TableCell className="font-bold py-1 px-1 text-sm">Total</TableCell><TableCell className="text-right font-bold py-1 px-1 text-sm">{formatCurrency(totalFD)}</TableCell><TableCell className="py-1 px-1"></TableCell></TableRow></TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Debt Funds Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Debt Funds</CardTitle>
            <Button size="sm" onClick={() => handleAddRow(setDebtFunds, { id: Date.now().toString(), name: '', currentValue: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="py-1 px-1">Name</TableHead><TableHead className="text-right py-1 px-1">Value</TableHead><TableHead className="w-[10%] py-1 px-1"></TableHead></TableRow></TableHeader>
              <TableBody>
                {debtFunds.map(item => (
                  <TableRow key={item.id} className="h-9">
                    <TableCell className="p-0"><Input value={item.name} onChange={e => handleInputChange(setDebtFunds, item.id, 'name', e.target.value)} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm" /></TableCell>
                    <TableCell className="p-0"><Input type="number" value={item.currentValue} onChange={e => handleInputChange(setDebtFunds, item.id, 'currentValue', Number(e.target.value))} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm text-right" /></TableCell>
                    <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(setDebtFunds, item.id)} className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter><TableRow><TableCell className="font-bold py-1 px-1 text-sm">Total</TableCell><TableCell className="text-right font-bold py-1 px-1 text-sm">{formatCurrency(totalDebtFunds)}</TableCell><TableCell className="py-1 px-1"></TableCell></TableRow></TableFooter>
            </Table>
          </CardContent>
        </Card>

        {/* Government Investments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Government Investments</CardTitle>
            <Button size="sm" onClick={() => handleAddRow(setGovInvestments, { id: Date.now().toString(), name: '', currentValue: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead className="py-1 px-1">Name</TableHead><TableHead className="text-right py-1 px-1">Value</TableHead><TableHead className="w-[10%] py-1 px-1"></TableHead></TableRow></TableHeader>
              <TableBody>
                {govInvestments.map(item => (
                  <TableRow key={item.id} className="h-9">
                    <TableCell className="p-0"><Input value={item.name} onChange={e => handleInputChange(setGovInvestments, item.id, 'name', e.target.value)} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm" /></TableCell>
                    <TableCell className="p-0"><Input type="number" value={item.currentValue} onChange={e => handleInputChange(setGovInvestments, item.id, 'currentValue', Number(e.target.value))} className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm text-right" /></TableCell>
                    <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(setGovInvestments, item.id)} className="h-7 w-7"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter><TableRow><TableCell className="font-bold py-1 px-1 text-sm">Total</TableCell><TableCell className="text-right font-bold py-1 px-1 text-sm">{formatCurrency(totalGov)}</TableCell><TableCell className="py-1 px-1"></TableCell></TableRow></TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Debt;