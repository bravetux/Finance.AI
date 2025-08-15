"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface Policy {
  id: string;
  type: string;
  name: string;
  policyNo: string;
  covered: string;
  amount: string;
  nominee: string;
  advisor: string;
  validTill: string;
  premium: string;
  dueDate: string;
  remarks: string;
}

export const FidokInsurancePolicies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(() => {
    try {
      const saved = localStorage.getItem('fidokInsurancePolicies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokInsurancePolicies', JSON.stringify(policies));
  }, [policies]);

  const handleAddRow = () => {
    setPolicies(prev => [...prev, { id: Date.now().toString(), type: '', name: '', policyNo: '', covered: '', amount: '', nominee: '', advisor: '', validTill: '', premium: '', dueDate: '', remarks: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setPolicies(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Policy, value: string) => {
    setPolicies(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Life, Health and Other Insurance Policies</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type of Policy</TableHead>
                <TableHead>Name of the policy</TableHead>
                <TableHead>Policy No.</TableHead>
                <TableHead>Name of the Covered</TableHead>
                <TableHead>Amount Insured</TableHead>
                <TableHead>Nominee</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Valid Till</TableHead>
                <TableHead>Premium (Rs.)</TableHead>
                <TableHead>Premium Due date</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="p-1"><Input value={p.type} onChange={e => handleChange(p.id, 'type', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.name} onChange={e => handleChange(p.id, 'name', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.policyNo} onChange={e => handleChange(p.id, 'policyNo', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.covered} onChange={e => handleChange(p.id, 'covered', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.amount} onChange={e => handleChange(p.id, 'amount', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.nominee} onChange={e => handleChange(p.id, 'nominee', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.advisor} onChange={e => handleChange(p.id, 'advisor', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.validTill} onChange={e => handleChange(p.id, 'validTill', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.premium} onChange={e => handleChange(p.id, 'premium', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.dueDate} onChange={e => handleChange(p.id, 'dueDate', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={p.remarks} onChange={e => handleChange(p.id, 'remarks', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};