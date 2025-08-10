"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Repeat, Upload, Download, Trash2, Edit, Save } from "lucide-react";
import { saveAs } from "file-saver";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SIPData {
  id: string;
  fundName: string;
  sipAmount: number;
  startDate: string;
}

const initialSIPData: SIPData[] = Array.from({ length: 10 }, (_, i) => ({
  id: `sip-${i + 1}`,
  fundName: `Fund ${i + 1}`,
  sipAmount: 0,
  startDate: new Date().toISOString().split('T')[0], // Default to today's date
}));

const MutualFundSIP: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [sipData, setSipData] = useState<SIPData[]>(() => {
    try {
      const saved = localStorage.getItem('mutualFundSIPData');
      return saved ? JSON.parse(saved) : initialSIPData;
    } catch {
      return initialSIPData;
    }
  });

  useEffect(() => {
    localStorage.setItem('mutualFundSIPData', JSON.stringify(sipData));
  }, [sipData]);

  const handleInputChange = (id: string, field: keyof SIPData, value: string) => {
    setSipData(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: field === 'sipAmount' ? Number(value) || 0 : value } : item))
    );
  };

  const totals = useMemo(() => {
    const monthlyTotal = sipData.reduce((sum, item) => sum + item.sipAmount, 0);
    const annualTotal = monthlyTotal * 12;
    return { monthlyTotal, annualTotal };
  }, [sipData]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(sipData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'mutual-fund-sip-data.json');
    showSuccess('SIP data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'fundName' in item && 'sipAmount' in item && 'startDate' in item)) {
          setSipData(data);
          showSuccess('SIP data imported successfully!');
        } else {
          showError('Invalid file format.');
        }
      } catch (err) {
        showError('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    setSipData(initialSIPData);
    showSuccess('SIP data has been reset.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Repeat className="h-8 w-8" />
          Mutual Fund SIP
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all SIP data on this page to its default state. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <><Save className="mr-2 h-4 w-4" /> Save</>
            ) : (
              <><Edit className="mr-2 h-4 w-4" /> Edit</>
            )}
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" /> Import
              <Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} />
            </Label>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SIP Tracker</CardTitle>
          <CardDescription>Manage and track your monthly Systematic Investment Plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Fund Name</TableHead>
                  <TableHead>SIP Amount (INR)</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sipData.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium p-1">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={item.fundName}
                          onChange={e => handleInputChange(item.id, 'fundName', e.target.value)}
                          className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                        />
                      ) : (
                        <span className="px-3">{item.fundName}</span>
                      )}
                    </TableCell>
                    <TableCell className="p-1">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.sipAmount}
                          onChange={e => handleInputChange(item.id, 'sipAmount', e.target.value)}
                          className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                        />
                      ) : (
                        <span className="px-3">{formatCurrency(item.sipAmount)}</span>
                      )}
                    </TableCell>
                    <TableCell className="p-1">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={item.startDate}
                          onChange={e => handleInputChange(item.id, 'startDate', e.target.value)}
                          className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                        />
                      ) : (
                        <span className="px-3">{item.startDate}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Monthly SIP</TableCell>
                  <TableCell colSpan={2}>{formatCurrency(totals.monthlyTotal)}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Annual SIP</TableCell>
                  <TableCell colSpan={2}>{formatCurrency(totals.annualTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MutualFundSIP;