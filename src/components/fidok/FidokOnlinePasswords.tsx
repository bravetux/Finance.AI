"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface PasswordInfo {
  id: string;
  loginKind: string;
  awarePerson: string;
  remarks: string;
}

const initialPasswords: PasswordInfo[] = [
  { id: '1', loginKind: 'Personal Email', awarePerson: '', remarks: '' },
  { id: '2', loginKind: 'Password Manager', awarePerson: '', remarks: '' },
  { id: '3', loginKind: 'Mobile Phone Unlock', awarePerson: '', remarks: '' },
];

export const FidokOnlinePasswords: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordInfo[]>(() => {
    try {
      const saved = localStorage.getItem('fidokOnlinePasswords');
      return saved ? JSON.parse(saved) : initialPasswords;
    } catch {
      return initialPasswords;
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokOnlinePasswords', JSON.stringify(passwords));
  }, [passwords]);

  const handleChange = (id: string, field: keyof PasswordInfo, value: string) => {
    setPasswords(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Online Passwords</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Login Kind</TableHead>
              <TableHead>Person who is aware of Password</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passwords.map(pw => (
              <TableRow key={pw.id}>
                <TableCell className="font-medium p-1">{pw.loginKind}</TableCell>
                <TableCell className="p-1"><Input value={pw.awarePerson} onChange={e => handleChange(pw.id, 'awarePerson', e.target.value)} /></TableCell>
                <TableCell className="p-1"><Input value={pw.remarks} onChange={e => handleChange(pw.id, 'remarks', e.target.value)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};