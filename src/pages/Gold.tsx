"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Gem, Upload, Download, Trash2, PlusCircle } from "lucide-react";
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

interface GoldAsset {
  id: string;
  particulars: string;
  value: number;
}

const initialAssets: GoldAsset[] = [
  { id: '1', particulars: 'Jewellery', value: 4000000 },
  { id: '2', particulars: 'SGB', value: 0 },
  { id: '3', particulars: 'Digital Gold', value: 0 },
  { id: '4', particulars: 'Gold ETF - Sankari', value: 1000000 },
  { id: '5', particulars: 'Gold ETF - Vignesh', value: 2890000 },
  { id: '6', particulars: 'Gold ETF', value: 3890000 },
];

const Gold: React.FC = () => {
  const [assets, setAssets] = useState<GoldAsset[]>(() => {
    try {
      const saved = localStorage.getItem('goldData');
      return saved ? JSON.parse(saved) : initialAssets;
    } catch {
      return initialAssets;
    }
  });

  useEffect(() => {
    localStorage.setItem('goldData', JSON.stringify(assets));
  }, [assets]);

  const handleInputChange = (id: string, field: keyof GoldAsset, value: string | number) => {
    setAssets(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddRow = () => {
    const newAsset: GoldAsset = {
      id: Date.now().toString(),
      particulars: '',
      value: 0,
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const handleDeleteRow = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const totalValue = useMemo(() => {
    return assets.reduce((sum, p) => sum + p.value, 0);
  }, [assets]);

  const chartData = useMemo(() => {
    return assets
      .filter(p => p.value > 0)
      .map(p => ({
        name: p.particulars,
        value: p.value,
      }));
  }, [assets]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(assets, null, 2)], { type: 'application/json' });
    saveAs(blob, 'gold-data.json');
    showSuccess('Gold data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.every(item => 'id' in item && 'particulars' in item && 'value' in item)) {
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
    showSuccess('Gold data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gem className="h-8 w-8" />
          Gold
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
                  This will delete all gold asset entries. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear data</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[400px] w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gold Holdings</CardTitle>
              <Button size="sm" onClick={handleAddRow}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-1 px-1">Particulars</TableHead>
                    <TableHead className="text-right py-1 px-1">Value (INR)</TableHead>
                    <TableHead className="w-[10%] py-1 px-1"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(p => (
                    <TableRow key={p.id} className="h-9">
                      <TableCell className="p-0">
                        <Input
                          value={p.particulars}
                          onChange={e => handleInputChange(p.id, 'particulars', e.target.value)}
                          className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <Input
                          type="number"
                          value={p.value}
                          onChange={e => handleInputChange(p.id, 'value', Number(e.target.value))}
                          className="bg-transparent border-0 focus-visible:ring-0 h-7 text-sm text-right"
                        />
                      </TableCell>
                      <TableCell className="p-0 text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(p.id)} className="h-7 w-7">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold py-1 px-1 text-sm">Total</TableCell>
                    <TableCell className="text-right font-bold py-1 px-1 text-sm">{formatCurrency(totalValue)}</TableCell>
                    <TableCell className="py-1 px-1"></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={chartData} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Gold;