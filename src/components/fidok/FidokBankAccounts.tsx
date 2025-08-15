"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface BankAccount {
  id: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  nominees: string;
  email: string;
  mobile: string;
}

export const FidokBankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    try {
      const saved = localStorage.getItem('fidokBankAccounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokBankAccounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleAddRow = () => {
    setAccounts(prev => [...prev, { id: Date.now().toString(), holderName: '', bankName: '', accountNumber: '', accountType: '', nominees: '', email: '', mobile: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setAccounts(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof BankAccount, value: string) => {
    setAccounts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank Account Details</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>A/C Holder Name</TableHead>
                <TableHead>Bank Name & Branch</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Type of Account</TableHead>
                <TableHead>Nominee/s</TableHead>
                <TableHead>Registered Email</TableHead>
                <TableHead>Registered Mobile</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(acc => (
                <TableRow key={acc.id}>
                  <TableCell className="p-1"><Input value={acc.holderName} onChange={e => handleChange(acc.id, 'holderName', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.bankName} onChange={e => handleChange(acc.id, 'bankName', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.accountNumber} onChange={e => handleChange(acc.id, 'accountNumber', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.accountType} onChange={e => handleChange(acc.id, 'accountType', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.nominees} onChange={e => handleChange(acc.id, 'nominees', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.email} onChange={e => handleChange(acc.id, 'email', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={acc.mobile} onChange={e => handleChange(acc.id, 'mobile', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(acc.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};