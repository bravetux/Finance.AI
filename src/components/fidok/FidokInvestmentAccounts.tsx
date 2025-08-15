"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface InvestmentPart1 {
  id: string;
  type: string;
  platform: string;
  holderName: string;
  agent: string;
  accountNo: string;
  nominees: string;
  maturity: string;
}

interface InvestmentPart2 {
  id: string;
  type: string;
  platform: string;
  holderName: string;
  linkedBank: string;
  mobile: string;
  email: string;
  remarks: string;
}

const initialInvestments1: InvestmentPart1[] = [
  { id: '1', type: 'Mutual Funds', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
  { id: '2', type: 'Fixed Deposits', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
  { id: '3', type: 'Shares - Demat', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
  { id: '4', type: 'Public Provident Fund', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
  { id: '5', type: 'EPF', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
  { id: '6', type: 'Others', platform: '', holderName: '', agent: '', accountNo: '', nominees: '', maturity: '' },
];

const initialInvestments2: InvestmentPart2[] = [
  { id: '1', type: 'Mutual Funds', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
  { id: '2', type: 'Fixed Deposits', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
  { id: '3', type: 'Shares - Demat', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
  { id: '4', type: 'Public Provident Fund', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
  { id: '5', type: 'Employee PF', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
  { id: '6', type: 'Others', platform: '', holderName: '', linkedBank: '', mobile: '', email: '', remarks: '' },
];

export const FidokInvestmentAccounts: React.FC = () => {
  const [investments1, setInvestments1] = useState<InvestmentPart1[]>(() => {
    try { const saved = localStorage.getItem('fidokInvestments1'); return saved ? JSON.parse(saved) : initialInvestments1; } catch { return initialInvestments1; }
  });
  const [investments2, setInvestments2] = useState<InvestmentPart2[]>(() => {
    try { const saved = localStorage.getItem('fidokInvestments2'); return saved ? JSON.parse(saved) : initialInvestments2; } catch { return initialInvestments2; }
  });

  useEffect(() => { localStorage.setItem('fidokInvestments1', JSON.stringify(investments1)); }, [investments1]);
  useEffect(() => { localStorage.setItem('fidokInvestments2', JSON.stringify(investments2)); }, [investments2]);

  const handleChange1 = (id: string, field: keyof InvestmentPart1, value: string) => {
    setInvestments1(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleChange2 = (id: string, field: keyof InvestmentPart2, value: string) => {
    setInvestments2(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Investment Account Details - Part 1</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Platform</TableHead><TableHead>Holder Name</TableHead><TableHead>Agent/Advisor</TableHead><TableHead>Account No.</TableHead><TableHead>Nominee/s</TableHead><TableHead>Maturity</TableHead></TableRow></TableHeader>
              <TableBody>
                {investments1.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium p-1">{inv.type}</TableCell>
                    <TableCell className="p-1"><Input value={inv.platform} onChange={e => handleChange1(inv.id, 'platform', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.holderName} onChange={e => handleChange1(inv.id, 'holderName', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.agent} onChange={e => handleChange1(inv.id, 'agent', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.accountNo} onChange={e => handleChange1(inv.id, 'accountNo', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.nominees} onChange={e => handleChange1(inv.id, 'nominees', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.maturity} onChange={e => handleChange1(inv.id, 'maturity', e.target.value)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Investment Account Details - Part 2</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Platform</TableHead><TableHead>Holder Name</TableHead><TableHead>Linked Bank</TableHead><TableHead>Regd. Mobile</TableHead><TableHead>Regd. Email</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {investments2.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium p-1">{inv.type}</TableCell>
                    <TableCell className="p-1"><Input value={inv.platform} onChange={e => handleChange2(inv.id, 'platform', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.holderName} onChange={e => handleChange2(inv.id, 'holderName', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.linkedBank} onChange={e => handleChange2(inv.id, 'linkedBank', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.mobile} onChange={e => handleChange2(inv.id, 'mobile', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.email} onChange={e => handleChange2(inv.id, 'email', e.target.value)} /></TableCell>
                    <TableCell className="p-1"><Input value={inv.remarks} onChange={e => handleChange2(inv.id, 'remarks', e.target.value)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};