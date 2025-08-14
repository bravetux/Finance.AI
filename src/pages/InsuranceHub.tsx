"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PolicyType = 'Term' | 'Health' | 'Vehicle' | 'Other';

interface InsurancePolicy {
  id: string;
  policyName: string;
  insurer: string;
  policyNumber: string;
  coverageAmount: number;
  annualPremium: number;
  expiryDate: string;
  type: PolicyType;
}

const initialPolicies: InsurancePolicy[] = [];

const InsuranceHub: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>(() => {
    try {
      const saved = localStorage.getItem('insuranceHubData');
      return saved ? JSON.parse(saved) : initialPolicies;
    } catch {
      return initialPolicies;
    }
  });

  useEffect(() => {
    localStorage.setItem('insuranceHubData', JSON.stringify(policies));
  }, [policies]);

  const handleAddRow = () => {
    const newPolicy: InsurancePolicy = {
      id: Date.now().toString(),
      policyName: '',
      insurer: '',
      policyNumber: '',
      coverageAmount: 0,
      annualPremium: 0,
      expiryDate: '',
      type: 'Other',
    };
    setPolicies(prev => [...prev, newPolicy]);
  };

  const handleDeleteRow = (id: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== id));
  };

  const handlePolicyChange = (id: string, field: keyof InsurancePolicy, value: string | number) => {
    setPolicies(prev =>
      prev.map(policy => (policy.id === id ? { ...policy, [field]: value } : policy))
    );
  };

  const premiumSummary = useMemo(() => {
    return policies.reduce(
      (acc, policy) => {
        acc.total += policy.annualPremium;
        if (policy.type === 'Term') {
          acc.term += policy.annualPremium;
        } else if (policy.type === 'Health') {
          acc.health += policy.annualPremium;
        }
        return acc;
      },
      { total: 0, term: 0, health: 0 }
    );
  }, [policies]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(policies, null, 2)], { type: 'application/json' });
    saveAs(blob, 'insurance-hub-data.json');
    showSuccess('Insurance data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'policyName' in item)) {
          const policiesWithDefaults = data.map(p => ({ ...p, type: p.type || 'Other' }));
          setPolicies(policiesWithDefaults);
          showSuccess('Insurance data imported successfully!');
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
    setPolicies([]);
    showSuccess('All insurance data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" />
          Insurance Hub
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will delete all insurance entries. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}><Upload className="mr-2 h-4 w-4" /> Export</Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file" className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Import<Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} /></Label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Annual Premium</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(premiumSummary.total)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Term Insurance Premium</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(premiumSummary.term)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Health Insurance Premium</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(premiumSummary.health)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Insurance Policies</CardTitle>
            <CardDescription>A central place to manage all your insurance policies.</CardDescription>
          </div>
          <Button onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Policy</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Policy Type</TableHead>
                  <TableHead>Insurer</TableHead>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Coverage Amount</TableHead>
                  <TableHead>Annual Premium</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.length > 0 ? policies.map(policy => (
                  <TableRow key={policy.id}>
                    <TableCell className="p-1"><Input value={policy.policyName} onChange={e => handlePolicyChange(policy.id, 'policyName', e.target.value)} placeholder="e.g., Term Life" className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1">
                      <Select value={policy.type} onValueChange={(value: PolicyType) => handlePolicyChange(policy.id, 'type', value)}>
                        <SelectTrigger className="bg-transparent border-0 focus-visible:ring-1 h-8 w-[120px]">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Term">Term</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Vehicle">Vehicle</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1"><Input value={policy.insurer} onChange={e => handlePolicyChange(policy.id, 'insurer', e.target.value)} placeholder="e.g., LIC" className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input value={policy.policyNumber} onChange={e => handlePolicyChange(policy.id, 'policyNumber', e.target.value)} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input type="text" value={policy.coverageAmount.toLocaleString('en-IN')} onChange={e => handlePolicyChange(policy.id, 'coverageAmount', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input type="text" value={policy.annualPremium.toLocaleString('en-IN')} onChange={e => handlePolicyChange(policy.id, 'annualPremium', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="p-1"><Input type="date" value={policy.expiryDate} onChange={e => handlePolicyChange(policy.id, 'expiryDate', e.target.value)} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                    <TableCell className="text-right p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(policy.id)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={8} className="text-center h-24 text-muted-foreground">No policies added yet.</TableCell></TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={5}>Total Annual Premium</TableCell>
                  <TableCell>{formatCurrency(premiumSummary.total)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceHub;