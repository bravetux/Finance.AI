"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, LayoutDashboard } from "lucide-react";
import GenericPieChart from "@/components/GenericPieChart";

// Define a common interface for assets
interface Asset {
  id: string;
  particulars: string;
  value: number;
}

const PreciousMetalsSummary: React.FC = () => {
  const [goldData, setGoldData] = useState<Asset[]>([]);
  const [silverData, setSilverData] = useState<Asset[]>([]);
  const [platinumData, setPlatinumData] = useState<Asset[]>([]);
  const [diamondData, setDiamondData] = useState<Asset[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        setGoldData(JSON.parse(localStorage.getItem('goldData') || '[]'));
        setSilverData(JSON.parse(localStorage.getItem('silverData') || '[]'));
        setPlatinumData(JSON.parse(localStorage.getItem('platinumData') || '[]'));
        setDiamondData(JSON.parse(localStorage.getItem('diamondData') || '[]'));
      } catch (error) {
        console.error("Failed to load precious metals data from localStorage:", error);
      }
    };

    loadData();
    // Add event listener to update if data changes in other tabs
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const summary = useMemo(() => {
    const allAssets = [...goldData, ...silverData, ...platinumData, ...diamondData];

    const totalJewelleryValue = allAssets
      .filter(asset => asset.particulars.toLowerCase().includes('jewellery'))
      .reduce((sum, asset) => sum + (asset.value || 0), 0);

    const totalOtherValue = allAssets
      .filter(asset => !asset.particulars.toLowerCase().includes('jewellery'))
      .reduce((sum, asset) => sum + (asset.value || 0), 0);
      
    const totalValue = totalJewelleryValue + totalOtherValue;

    const chartData = [
      { name: 'Jewellery', value: totalJewelleryValue },
      { name: 'Other Precious Metals', value: totalOtherValue },
    ].filter(item => item.value > 0);

    return {
      totalJewelleryValue,
      totalOtherValue,
      totalValue,
      chartData,
    };
  }, [goldData, silverData, platinumData, diamondData]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          Precious Metals Summary
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Precious Metals Value</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Sum of all gold, silver, platinum, and diamond assets.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jewellery Value</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-500">{formatCurrency(summary.totalJewelleryValue)}</div>
            <p className="text-xs text-muted-foreground">Sum of all jewellery items.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Other Metals Value</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(summary.totalOtherValue)}</div>
            <p className="text-xs text-muted-foreground">Sum of coins, bars, ETFs, etc.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <GenericPieChart data={summary.chartData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PreciousMetalsSummary;