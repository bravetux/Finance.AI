"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface FamilyMember {
  id: string;
  coupleNames: string;
  dependentChildren: string;
  dependentParents: string;
}

export const FidokFamilyMembers: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('fidokFamilyMembers');
      return saved ? JSON.parse(saved) : [{ id: '1', coupleNames: '', dependentChildren: '', dependentParents: '' }];
    } catch {
      return [{ id: '1', coupleNames: '', dependentChildren: '', dependentParents: '' }];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokFamilyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  const handleAddRow = () => {
    setFamilyMembers(prev => [...prev, { id: Date.now().toString(), coupleNames: '', dependentChildren: '', dependentParents: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setFamilyMembers(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof FamilyMember, value: string) => {
    setFamilyMembers(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Names of Family Members</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Couple Names</TableHead>
              <TableHead>Dependent Children</TableHead>
              <TableHead>Dependent Parents</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familyMembers.map(member => (
              <TableRow key={member.id}>
                <TableCell className="p-1"><Input value={member.coupleNames} onChange={e => handleChange(member.id, 'coupleNames', e.target.value)} /></TableCell>
                <TableCell className="p-1"><Input value={member.dependentChildren} onChange={e => handleChange(member.id, 'dependentChildren', e.target.value)} /></TableCell>
                <TableCell className="p-1"><Input value={member.dependentParents} onChange={e => handleChange(member.id, 'dependentParents', e.target.value)} /></TableCell>
                <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(member.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};