"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  particulars: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  remarks: string;
}

const initialContacts: Contact[] = [
  { id: '1', particulars: 'Self', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '2', particulars: 'Spouse', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '3', particulars: 'Family Doctor', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '4', particulars: 'Financial Advisor', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '5', particulars: 'Lawyer', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '6', particulars: 'Chartered Accountant', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '7', particulars: 'Office HR', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '8', particulars: 'Others (Mention Name)', name: '', mobile: '', email: '', address: '', remarks: '' },
  { id: '9', particulars: 'Others (Mention Name)', name: '', mobile: '', email: '', address: '', remarks: '' },
];

export const FidokImportantContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('fidokImportantContacts');
      return saved ? JSON.parse(saved) : initialContacts;
    } catch {
      return initialContacts;
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokImportantContacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleChange = (id: string, field: keyof Contact, value: string) => {
    setContacts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Important Contacts for Family</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Particulars</TableHead>
                <TableHead>Name of Contact</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium p-1">{contact.particulars}</TableCell>
                  <TableCell className="p-1"><Input value={contact.name} onChange={e => handleChange(contact.id, 'name', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={contact.mobile} onChange={e => handleChange(contact.id, 'mobile', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={contact.email} onChange={e => handleChange(contact.id, 'email', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={contact.address} onChange={e => handleChange(contact.id, 'address', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={contact.remarks} onChange={e => handleChange(contact.id, 'remarks', e.target.value)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};