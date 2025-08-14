"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HandCoins, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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

interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  amountPaid: number;
  interestRate: number;
  emi: number;
}

const initialLoans: Loan[] = [];

const LoanTracker: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('loanTrackerData');
      return saved ? JSON.parse(saved) : initialLoans;
    } catch {
      return initialLoans;
    }
  });

  useEffect(() => {
    localStorage.setItem('loanTrackerData', JSON.stringify(loans));
  }, [loans]);

  const handleAddRow = () => {
    const newLoan: Loan = {
      id: Date.now().toString(),
      name: '',
      totalAmount: 0,
      amountPaid: 0,
      interestRate: 0,
      emi: 0,
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const handleDeleteRow = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  const handleLoanChange = (id: string, field: keyof Loan, value: string | number) => {
    setLoans(prev =>
      prev.map(loan => (loan.id === id ? { ...loan, [field]: value } : loan))
    );
  };

  const totals = useMemo(() => {
    return loans.reduce(
      (acc, loan) => {
        acc.totalAmount += loan.totalAmount;
        acc.amountPaid += loan.amountPaid;
        acc.remainingPrincipal += (loan.totalAmount - loan.amountPaid);
        acc.totalEmi += loan.emi;
        return acc;
      },
      { totalAmount: 0, amountPaid: 0, remainingPrincipal: 0, totalEmi: 0 }
    );
  }, [loans]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(loans, null, 2)], { type: 'application/json' });
    saveAs(blob, 'loan-tracker-data.json');
    showSuccess('Loan data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'name' in item && 'totalAmount' in item)) {
          setLoans(data);
          showSuccess('Loan data imported successfully!');
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
    setLoans([]);
    showSuccess('All loan data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HandCoins className="h-8 w-8" />
          Loan & Liability Tracker
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will delete all loan entries. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}><Upload className="mr-2 h-4 w-4" /> Export</Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Import<Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} /></Label>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Loans</CardTitle>
            <CardDescription>Track all your outstanding loans and liabilities.</CardDescription>
          </div>
          <Button onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Loan</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Name</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Interest Rate (%)</TableHead>
                  <TableHead>EMI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length > 0 ? loans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell className="p-1"><Input value={loan.name} onChange={e => handleLoanChange(loan.id, 'name', e.target.value)} placeholder="e.g., Home Loan" className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input type="text" value={loan.totalAmount.toLocaleString('en-IN')} onChange={e => handleLoanChange(loan.id, 'totalAmount', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input type="text" value={loan.amountPaid.toLocaleString('en-IN')} onChange={e => handleLoanChange(loan.id, 'amountPaid', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell>{formatCurrency(loan.totalAmount - loan.amountPaid)}</TableCell>
                    <TableCell className="p-1"><Input type="number" value={loan.interestRate} onChange={e => handleLoanChange(loan.id, 'interestRate', e.target.value)} className="bg-transparent border-0 focus-visible:ring-1 h-8 w-20" /></TableCell>
                    <TableCell className="p-1"><Input type="text" value={loan.emi.toLocaleString('en-IN')} onChange={e => handleLoanChange(loan.id, 'emi', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="text-right p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(loan.id)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No loans added yet.</TableCell></TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{formatCurrency(totals.totalAmount)}</TableCell>
                  <TableCell>{formatCurrency(totals.amountPaid)}</TableCell>
                  <TableCell>{formatCurrency(totals.remainingPrincipal)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatCurrency(totals.totalEmi)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanTracker;