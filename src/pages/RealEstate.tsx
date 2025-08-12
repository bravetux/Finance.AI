"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Home, Upload, Download, Trash2 } from "lucide-react";
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

// Interfaces for our data structures
interface PropertyValue {
  id: string;
  name: string;
  value: number;
}

interface RentalProperty {
  id: string;
  name: string;
  value: number;
  rent: number;
}

// Initial data now excludes REIT
const initialPropertyValues: PropertyValue[] = [
  { id: 'pv1', name: 'Home 1', value: 0 },
  { id: 'pv2', name: 'Home 2', value: 0 },
  { id: 'pv3', name: 'Commercial 1', value: 0 },
  { id: 'pv4', name: 'Commercial 2', value: 0 },
  { id: 'pv5', name: 'Land', value: 0 },
];

const initialRentalProperties: RentalProperty[] = [
  { id: 'rp1', name: 'Home 1', value: 0, rent: 0 },
  { id: 'rp2', name: 'Commercial 1', value: 0, rent: 0 },
  { id: 'rp3', name: 'Home 2', value: 0, rent: 0 },
];

const RealEstate: React.FC = () => {
  // State for property values
  const [propertyValues, setPropertyValues] = useState<PropertyValue[]>(() => {
    try {
      const saved = localStorage.getItem('realEstatePropertyValues');
      return saved ? JSON.parse(saved) : initialPropertyValues;
    } catch {
      return initialPropertyValues;
    }
  });

  // State for REIT value
  const [reitValue, setReitValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('realEstateReitValue');
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  // State for rental yield properties
  const [rentalProperties, setRentalProperties] = useState<RentalProperty[]>(() => {
    try {
      const saved = localStorage.getItem('realEstateRentalProperties');
      return saved ? JSON.parse(saved) : initialRentalProperties;
    } catch {
      return initialRentalProperties;
    }
  });

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('realEstatePropertyValues', JSON.stringify(propertyValues));
  }, [propertyValues]);

  useEffect(() => {
    localStorage.setItem('realEstateReitValue', JSON.stringify(reitValue));
  }, [reitValue]);

  useEffect(() => {
    localStorage.setItem('realEstateRentalProperties', JSON.stringify(rentalProperties));
  }, [rentalProperties]);

  // Update net worth data in localStorage whenever property or REIT values change
  useEffect(() => {
    try {
      const home1 = propertyValues.find(p => p.name === 'Home 1');
      const home1Value = home1 ? home1.value : 0;

      const totalPropertyValue = propertyValues.reduce((sum, p) => sum + p.value, 0);
      const otherRealEstateValue = totalPropertyValue - home1Value;

      const savedNetWorthData = localStorage.getItem('netWorthData');
      const netWorthData = savedNetWorthData ? JSON.parse(savedNetWorthData) : {};
      
      const updatedNetWorthData = {
        ...netWorthData,
        homeValue: home1Value,
        otherRealEstate: otherRealEstateValue,
        reits: reitValue,
      };

      localStorage.setItem('netWorthData', JSON.stringify(updatedNetWorthData));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to update net worth data from Real Estate page:", error);
    }
  }, [propertyValues, reitValue]);

  // Handlers for input changes
  const handlePropertyValueChange = (id: string, value: string) => {
    if (value.length > 9) return;
    setPropertyValues(prev =>
      prev.map(p => (p.id === id ? { ...p, value: Number(value) || 0 } : p))
    );
  };

  const handleReitValueChange = (value: string) => {
    if (value.length > 9) return;
    setReitValue(Number(value) || 0);
  };

  const handleRentalPropertyChange = (id: string, field: 'value' | 'rent', value: string) => {
    if (field === 'value' && value.length > 9) return;
    if (field === 'rent' && value.length > 7) return;
    setRentalProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: Number(value) || 0 } : p))
    );
  };

  // Calculations
  const totalPropertyValue = useMemo(() => {
    return propertyValues.reduce((sum, p) => sum + p.value, 0);
  }, [propertyValues]);

  const rentalCalculations = useMemo(() => {
    return rentalProperties.map(p => {
      const annualRent = p.rent * 12;
      const yieldPercent = p.value > 0 ? (annualRent / p.value) * 100 : 0;
      return { ...p, annualRent, yieldPercent };
    });
  }, [rentalProperties]);

  const propertyChartData = useMemo(() => {
    return propertyValues
      .filter(p => p.value > 0)
      .map(p => ({
        name: p.name,
        value: p.value,
      }));
  }, [propertyValues]);

  // Helper for formatting currency
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  // Data management functions
  const exportData = () => {
    const dataToExport = {
      propertyValues,
      rentalProperties,
      reitValue,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    saveAs(blob, 'real-estate-data.json');
    showSuccess('Real estate data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.propertyValues && data.rentalProperties) {
          setPropertyValues(data.propertyValues);
          setRentalProperties(data.rentalProperties);
          if (typeof data.reitValue === 'number') {
            setReitValue(data.reitValue);
          }
          showSuccess('Real estate data imported successfully!');
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
    setPropertyValues(initialPropertyValues.map(p => ({ ...p, value: 0 })));
    setRentalProperties(initialRentalProperties.map(p => ({ ...p, value: 0, rent: 0 })));
    setReitValue(0);
    showSuccess('Real estate data has been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Home className="h-8 w-8" />
          Real Estate
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
                  This will reset all data on this page to its default state. This action cannot be undone.
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
        className="min-h-[450px] w-full rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader>
              <CardTitle>Property Value</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Particulars</TableHead>
                    <TableHead className="text-right">Value (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyValues.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          value={p.value}
                          onChange={e => handlePropertyValueChange(p.id, e.target.value)}
                          className="w-full text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-offset-0 h-auto"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totalPropertyValue)}</TableCell>
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
              <CardTitle>Property Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={propertyChartData} showLegend={false} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Card>
        <CardHeader>
          <CardTitle>REIT (Real Estate Investment Trust)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="reit-value" className="text-lg font-medium">Current Value (INR)</Label>
            <div className="w-1/3">
              <Input
                id="reit-value"
                type="number"
                value={reitValue}
                onChange={e => handleReitValueChange(e.target.value)}
                className="text-right text-lg font-bold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rental Yield Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Particulars</TableHead>
                  <TableHead>Value (INR)</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead className="text-right">Annual Rent</TableHead>
                  <TableHead className="text-right">Yield %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentalCalculations.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={p.value}
                        onChange={e => handleRentalPropertyChange(p.id, 'value', e.target.value)}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={p.rent}
                        onChange={e => handleRentalPropertyChange(p.id, 'rent', e.target.value)}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.annualRent)}</TableCell>
                    <TableCell className="text-right">{p.yieldPercent.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📉 Rental Yield &lt; 6%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Low yield territory</strong> — the rental income isn’t compensating you enough for the property’s market value.</p>
            <p>This usually happens in metro/prime city areas where prices are high but rents haven’t kept pace.</p>
            <p>Treat the property more as a <strong>capital appreciation play</strong> rather than a pure income generator. You’re banking on long-term price growth.</p>
            <p>But if capital appreciation is also sluggish, your money is working too slowly — better to consider selling and reallocating to higher-yield or faster-growth assets.</p>
            <p>Alternative investments (REITs, bonds, dividend stocks) could beat your current yield with less headache.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>✅ Rental Yield ≥ 6%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Healthy income zone</strong> — you’re getting decent cash flow relative to property value.</p>
            <p>Can be a sign of undervalued property or high rental demand (often in tier-2/tier-3 cities or commercial spaces).</p>
            <p>You can hold and reinvest the rental income, potentially compounding returns.</p>
            <p>Still, compare with local REIT yields (often 6–8%) — if you’re earning more, you’ve got a solid asset.</p>
            <p>Factor in maintenance, vacancy, and tax — real net yield after expenses might be 1–2% lower.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>💡 Golden Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-muted-foreground">
            For long-term investors, a rental yield below 6% needs strong capital growth to justify holding. A yield above 6% can justify holding even without significant price appreciation, as the cash flow itself is robust.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealEstate;