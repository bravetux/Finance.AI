"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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

// Initial data based on the image
const initialLiquidAssets: LiquidAsset[] = [
  { id: 'l1', particulars: 'TMB', currentValue: 10000 },
  { id: 'l2', particulars: 'HDFC', currentValue: 140000 },
  { id: 'l3', particulars: 'IDFC', currentValue: 22800 },
  { id: 'l4', particulars: 'TMB Sankari', currentValue: 97000 },
];
const initialFixedDeposits: FixedDeposit[] = [
  { id: 'fd1', bankName: 'TMB - Sankari - 001 - 0199', currentValue: 304408 },
  { id: 'fd2', bankName: 'TMB - Sankari - 002 - 0138', currentValue: 104000 },
  { id: 'fd3', bankName: 'TMB - Sankari - 003 - 0134', currentValue: 23000 },
  { id: 'fd4', bankName: 'TMB - Sankari - 004 - 0135', currentValue: 200000 },
  { id: 'fd5', bankName: 'TMB - Sankari - 005 - 0133', currentValue: 50000 },
  { id: 'fd6', bankName: 'TMB - Sankari - 004 - 0925', currentValue: 360000 },
  { id: 'fd7', bankName: 'TMB - Sankari - 005 - 1745', currentValue: 20000 },
];
const initialDebtFunds: DebtFund[] = [
  { id: 'df1', name: 'INCRED FINANCIAL SERVICE Expiry 10-Nov-2026', currentValue: 10000 },
  { id: 'df2', name: 'ICICI Prudential Liquid Fund', currentValue: 99 },
  { id: 'df3', name: 'HDFC Liquid Fund', currentValue: 101 },
  { id: 'df4', name: 'AKARA CAPITAL ADVISORS Expiry 22-Feb-2026', currentValue: 95106 },
  { id: 'df5', name: 'TAPIR CONSTRUCTIONS Ltd Expiry 18-Jan-2027', currentValue: 100861 },
  { id: 'df6', name: 'NAVI FINSERV LIMITED Expiry 31-Dec-2027', currentValue: 10019 },
  { id: 'df7', name: 'Kosamattam Finance Limited Expiry 17-Jan-2028', currentValue: 20000 },
  { id: 'df8', name: 'MUTHOOT FINCORP LIMITED Expiry 24-Dec-2032', currentValue: 30020 },
  { id: 'df9', name: 'EDELWEISS FINANCIAL Ser. Expiry 29-Jan-2034', currentValue: 20000 },
  { id: 'df10', name: 'Mohammed Yasin', currentValue: 126700 },
  { id: 'df11', name: 'Annapurna Finance Private Ltd Expiry 24-Jan-2030', currentValue: 105000 },
];
const initialGovInvestments: GovInvestment[] = [
  { id: 'gi1', name: 'PPF', currentValue: 4750000 },
  { id: 'gi2', name: 'PF', currentValue: 1436125 },
  { id: 'gi3', name: 'LIC', currentValue: 1500000 },
  { id: 'gi4', name: 'PPF Sankari', currentValue: 1000000 },
  { id: 'gi5', name: 'PPF Vishnu', currentValue: 669000 },
];

const Debt: React.FC = () => {
  const [liquidAssets, setLiquidAssets] = useState<LiquidAsset[]>(initialLiquidAssets);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>(initialFixedDeposits);
  const [debtFunds, setDebtFunds] = useState<DebtFund[]>(initialDebtFunds);
  const [govInvestments, setGovInvestments] = useState<GovInvestment[]>(initialGovInvestments);

  // Generic handler for adding a new row
  const handleAddRow = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    newRow: T
  ) => {
    setter(prev => [...prev, newRow]);
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

  const pieChartData = useMemo(() => [
    { name: 'Liquid', value: totalLiquid },
    { name: 'Fixed Deposit', value: totalFD },
    { name: 'Debt Funds', value: totalDebtFunds },
    { name: 'Govt. Investments', value: totalGov },
  ], [totalLiquid, totalFD, totalDebtFunds, totalGov]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

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
                <AlertDialogAction onClick={() => {
                  setLiquidAssets([]);
                  setFixedDeposits([]);
                  setDebtFunds([]);
                  setGovInvestments([]);
                  showSuccess("All debt data has been cleared.");
                }}>Yes, clear all</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

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
            <Button size="sm" onClick={() => handleAddRow(setLiquidAssets, { id: Date.now().toString(), particulars: '', currentValue: 0 })}>
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