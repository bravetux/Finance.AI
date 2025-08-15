"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

interface CardDetail {
  id: string;
  holderName: string;
  cardType: string;
  cardNumber: string;
  linkedAccount: string;
  mobile: string;
  validTill: string;
  remarks: string;
}

export const FidokCards: React.FC = () => {
  const [cards, setCards] = useState<CardDetail[]>(() => {
    try {
      const saved = localStorage.getItem('fidokCards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fidokCards', JSON.stringify(cards));
  }, [cards]);

  const handleAddRow = () => {
    setCards(prev => [...prev, { id: Date.now().toString(), holderName: '', cardType: '', cardNumber: '', linkedAccount: '', mobile: '', validTill: '', remarks: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setCards(prev => prev.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof CardDetail, value: string) => {
    setCards(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Debit / Credit Card Details</CardTitle>
        <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Row</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cardholder Name</TableHead>
                <TableHead>Card Type</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Linked Account</TableHead>
                <TableHead>Registered Mobile No.</TableHead>
                <TableHead>Valid Till</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map(card => (
                <TableRow key={card.id}>
                  <TableCell className="p-1"><Input value={card.holderName} onChange={e => handleChange(card.id, 'holderName', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.cardType} onChange={e => handleChange(card.id, 'cardType', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.cardNumber} onChange={e => handleChange(card.id, 'cardNumber', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.linkedAccount} onChange={e => handleChange(card.id, 'linkedAccount', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.mobile} onChange={e => handleChange(card.id, 'mobile', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.validTill} onChange={e => handleChange(card.id, 'validTill', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Input value={card.remarks} onChange={e => handleChange(card.id, 'remarks', e.target.value)} /></TableCell>
                  <TableCell className="p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(card.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};