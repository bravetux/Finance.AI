"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  document: string;
  holder: string;
  docNumber: string;
  physicalLocation: string;
  virtualLocation: string;
  remarks: string;
}

const initialDocuments: Document[] = [
  { id: '1', document: 'PAN Card', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '2', document: 'Passport', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '3', document: 'Aadhar Card', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '4', document: 'Driving License', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '5', document: 'Election card', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '6', document: 'Will', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '7', document: 'Birth Certificate', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '8', document: 'Marriage Certificate', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '9', document: 'Locker key', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '10', document: 'Insurance Policies', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '11', document: 'Property Papers', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '12', document: 'Home Loan documents', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '13', document: 'Cheque books', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '14', document: 'Other Loan Documents', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '15', document: 'Income Tax Returns', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '16', document: 'Investment Documents', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '17', document: 'Mediclaim health card', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '18', document: 'Others (Mention Name)', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
  { id: '19', document: 'Others (Mention Name)', holder: '', docNumber: '', physicalLocation: '', virtualLocation: '', remarks: '' },
];

export const FidokFinancialDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem('fidokFinancialDocuments');
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokFinancialDocuments', JSON.stringify(documents));
  }, [documents]);

  const handleChange = (id: string, field: keyof Document, value: string) => {
    setDocuments(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Important Financial Documents</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Name of Holder</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Doc Location (Physical)</TableHead>
                <TableHead>Doc Location (Virtual)</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium p-1">{doc.document}</TableCell>
                  <TableCell className="p-1"><Input value={doc.holder} onChange={e => handleChange(doc.id, 'holder', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={doc.docNumber} onChange={e => handleChange(doc.id, 'docNumber', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={doc.physicalLocation} onChange={e => handleChange(doc.id, 'physicalLocation', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={doc.virtualLocation} onChange={e => handleChange(doc.id, 'virtualLocation', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={doc.remarks} onChange={e => handleChange(doc.id, 'remarks', e.target.value)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};