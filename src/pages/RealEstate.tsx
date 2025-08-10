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

// Initial data based on the image
const initialPropertyValues: PropertyValue[] = [
  { id: 'pv1', name: 'Home 1', value: 10000000 },
  { id: 'pv2', name: 'Home 2', value: 35000000 },
  { id: 'pv3', name: 'Commercial 1', value: 2500000 },
  { id: 'pv4', name: 'Commercial 2', value: 0 },
  { id: 'pv5', name: 'Land/Reit 1', value: 0 },
  { id: 'pv6', name: 'Land/Reit 2', value: 0 },
];

const initialRentalProperties: RentalProperty[] = [
  { id: 'rp1', name: 'Home 1', value: 6000000, rent: 21000 },
  { id: 'rp2', name: 'Commercial 1', value: 2500000, rent: 9500 },
  { id: 'rp3', name: 'Home 2', value: 12000000, rent: 25000 },
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
    localStorage.setItem('realEstateRentalProperties', JSON.stringify(rentalProperties));
  }, [rentalProperties]);

  // Handlers for input changes
  const handlePropertyValueChange = (id: string, value: string) => {
    setPropertyValues(prev =>
      prev.map(p => (p.id === id ? { ...p, value: Number(value) || 0 } : p))
    );
  };

  const handleRentalPropertyChange = (id: string, field: 'value' | 'rent', value: string) => {
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

  // Helper for formatting currency
  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  // Data management functions
  const exportData = () => {
    const dataToExport = {
      propertyValues,
      rentalProperties,
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
    setPropertyValues(initialPropertyValues);
    setRentalProperties(initialRentalProperties);
    showSuccess('Real estate data has been reset.');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Value Table */}
        <Card className="lg:col-span-1">
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
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={p.value}
                        onChange={e => handlePropertyValueChange(p.id, e.target.value)}
                        className="text-right"
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

        {/* Rental Yield Calculator Table */}
        <Card className="lg:col-span-2">
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
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={p.rent}
                          onChange={e => handleRentalPropertyChange(p.id, 'rent', e.target.value)}
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
      </div>
    </div>
  );
};

export default RealEstate;