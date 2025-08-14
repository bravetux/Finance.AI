"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bitcoin, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import GenericPieChart from "@/components/GenericPieChart";

interface CryptoAsset {
  id: string;
  name: string;
  currentValue: number;
}

const initialAssets: CryptoAsset[] = [];

const Cryptocurrency: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    try {
      const saved = localStorage.getItem('cryptoData');
      return saved ? JSON.parse(saved) : initialAssets;
    } catch {
      return initialAssets;
    }
  });

  useEffect(() => {
    localStorage.setItem('cryptoData', JSON.stringify(assets));
  }, [assets]);

  const totalValue = useMemo(() => {
    return assets.reduce((sum, p) => sum + p.currentValue, 0);
  }, [assets]);

  useEffect(() => {
    try {
      const savedNetWorthData = localStorage.getItem('netWorthData');
      const netWorthData = savedNetWorthData ? JSON.parse(savedNetWorthData) : {};
      
      const updatedNetWorthData = {
        ...netWorthData,
        cryptocurrency: totalValue,
      };

      localStorage.setItem('netWorthData', JSON.stringify(updatedNetWorthData));
    } catch (error) {
      console.error("Failed to update net worth data from Cryptocurrency page:", error);
    }
  }, [totalValue]);

  const handleAddRow = () => {
    const newAsset: CryptoAsset = {
      id: Date.now().toString(),
      name: '',
      currentValue: 0,
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const handleDeleteRow = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const handleAssetChange = (id: string, field: keyof CryptoAsset, value: string | number) => {
    setAssets(prev =>
      prev.map(asset => (asset.id === id ? { ...asset, [field]: value } : asset))
    );
  };

  const chartData = useMemo(() => {
    return assets
      .filter(p => p.currentValue > 0)
      .map(p => ({
        name: p.name,
        value: p.currentValue,
      }));
  }, [assets]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(assets, null, 2)], { type: 'application/json' });
    saveAs(blob, 'cryptocurrency-data.json');
    showSuccess('Crypto data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'name' in item && 'currentValue' in item)) {
          setAssets(data);
          showSuccess('Data imported successfully!');
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
    setAssets([]);
    showSuccess('All crypto data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bitcoin className="h-8 w-8" />
          Cryptocurrency
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will delete all crypto entries. This action cannot be undone.</AlertDialogDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Total Crypto Value</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
        </CardContent>
      </Card>

      <ResizablePanelGroup direction="horizontal" className="min-h-[400px] w-full rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Crypto Holdings</CardTitle>
              <Button size="sm" onClick={handleAddRow}><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Current Value (INR)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length > 0 ? assets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell className="p-1"><Input value={asset.name} onChange={e => handleAssetChange(asset.id, 'name', e.target.value)} placeholder="e.g., Bitcoin" className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                      <TableCell className="p-1"><Input type="text" value={asset.currentValue.toLocaleString('en-IN')} onChange={e => handleAssetChange(asset.id, 'currentValue', Number(e.target.value.replace(/,/g, '')))} className="bg-transparent border-0 focus-visible:ring-1 h-8" /></TableCell>
                      <TableCell className="text-right p-1"><Button variant="ghost" size="icon" onClick={() => handleDeleteRow(asset.id)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No assets added yet.</TableCell></TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell>{formatCurrency(totalValue)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader>
            <CardContent><GenericPieChart data={chartData} /></CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Cryptocurrency;