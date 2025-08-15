"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface Liability {
  id: string;
  lender: string;
  type: string;
  amount: string;
  terms: string;
  remarks: string;
}

export const FidokLiabilityDetails: React.FC = () => {
  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    try {
      const saved = localStorage.getItem('fidokLiabilityDetails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokLiabilityDetails', JSON.stringify(liabilities));
  }, [liabilities]);

  const handleAddRow = () => {
    setLiabilities(prev => [...prev, { id: Date.now().toString(), lender: '', type: '', amount: '', terms: '', remarks: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setLiabilities(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Liability, value: string) => {
    setLiabilities(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Liability Details</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank/Lender</TableHead>
                <TableHead>Type of liability</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liabilities.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="p-1"><Input value={item.lender} onChange={e => handleChange(item.id, 'lender', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={item.type} onChange={e => handleChange(item.id, 'type', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={item.amount} onChange={e => handleChange(item.id, 'amount', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={item.terms} onChange={e => handleChange(item.id, 'terms', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={item.remarks} onChange={e => handleChange(item.id, 'remarks', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};