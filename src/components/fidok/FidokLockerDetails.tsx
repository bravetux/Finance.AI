"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface Locker {
  id: string;
  bankName: string;
  accountNumber: string;
  lockerNumber: string;
  inNameOf: string;
  code: string;
  nominee: string;
  remarks: string;
}

export const FidokLockerDetails: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>(() => {
    try {
      const saved = localStorage.getItem('fidokLockerDetails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokLockerDetails', JSON.stringify(lockers));
  }, [lockers]);

  const handleAddRow = () => {
    setLockers(prev => [...prev, { id: Date.now().toString(), bankName: '', accountNumber: '', lockerNumber: '', inNameOf: '', code: '', nominee: '', remarks: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setLockers(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Locker, value: string) => {
    setLockers(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Locker Details</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank Name & Branch</TableHead>
                <TableHead>Bank Account Number</TableHead>
                <TableHead>Locker No.</TableHead>
                <TableHead>In the Name of</TableHead>
                <TableHead>Code/Remarks</TableHead>
                <TableHead>Nominee</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lockers.map(locker => (
                <TableRow key={locker.id}>
                  <TableCell className="p-1"><Input value={locker.bankName} onChange={e => handleChange(locker.id, 'bankName', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.accountNumber} onChange={e => handleChange(locker.id, 'accountNumber', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.lockerNumber} onChange={e => handleChange(locker.id, 'lockerNumber', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.inNameOf} onChange={e => handleChange(locker.id, 'inNameOf', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.code} onChange={e => handleChange(locker.id, 'code', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.nominee} onChange={e => handleChange(locker.id, 'nominee', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={locker.remarks} onChange={e => handleChange(locker.id, 'remarks', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(locker.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};