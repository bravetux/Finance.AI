"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  area: string;
  owners: string;
  regNo: string;
  nominee: string;
  remarks: string;
}

export const FidokPropertyDetails: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('fidokPropertyDetails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokPropertyDetails', JSON.stringify(properties));
  }, [properties]);

  const handleAddRow = () => {
    setProperties(prev => [...prev, { id: Date.now().toString(), name: '', area: '', owners: '', regNo: '', nominee: '', remarks: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setProperties(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Property, value: string) => {
    setProperties(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Property Details</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Name</TableHead>
                <TableHead>Property Area</TableHead>
                <TableHead>Name of Owners</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Nominee (If Any)</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map(prop => (
                <TableRow key={prop.id}>
                  <TableCell className="p-1"><Input value={prop.name} onChange={e => handleChange(prop.id, 'name', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={prop.area} onChange={e => handleChange(prop.id, 'area', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={prop.owners} onChange={e => handleChange(prop.id, 'owners', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={prop.regNo} onChange={e => handleChange(prop.id, 'regNo', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={prop.nominee} onChange={e => handleChange(prop.id, 'nominee', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={prop.remarks} onChange={e => handleChange(prop.id, 'remarks', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(prop.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};