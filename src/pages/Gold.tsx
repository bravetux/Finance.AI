"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Gem, Upload, Download, Trash2 } from "lucide-react";
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
  { id: '4', particulars: 'Gold ETF - Spouse', value: 1000000 },
  { id: '5', particulars: 'Gold ETF - Self', value: 2890000 },
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

  const handleValueChange = (id: string, value: number) => {
    setAssets(prev =>
      prev.map(p => (p.id === id ? { ...p, value: value } : p))
    );
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
    const clearedAssets = assets.map(asset => ({ ...asset, value: 0 }));
    setAssets(clearedAssets);
    showSuccess('Gold data values have been cleared.');
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
                <Trash2 className="mr-2 h-4 w-4" /> Clear Values
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all gold asset values to zero. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, clear values</AlertDialogAction>
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
            <CardHeader>
              <CardTitle>Gold Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-1 px-2">Particulars</TableHead>
                    <TableHead className="text-right py-1 px-2">Value (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map(p => (
                    <TableRow key={p.id} className="h-10">
                      <TableCell className="font-medium py-1 px-2">{p.particulars}</TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          value={p.value}
                          onChange={e => handleValueChange(p.id, Number(e.target.value))}
                          className="bg-transparent border-0 focus-visible:ring-1 h-8 text-sm text-right"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold py-2 px-2 text-sm">Total</TableCell>
                    <TableCell className="text-right font-bold py-2 px-2 text-sm">{formatCurrency(totalValue)}</TableCell>
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