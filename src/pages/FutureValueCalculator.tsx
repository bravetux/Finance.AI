"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
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

interface Asset {
  name: string;
  currentValue: number;
  roi: number;
  duration: number;
  futureValue: number;
}

// Helper function to calculate future value
const calculateFutureValue = (pv: number, r: number, t: number) => {
  return pv * Math.pow(1 + r / 100, t);
};

const FutureValueCalculator: React.FC = () => {
  const navigate = useNavigate();

  const initializeAssets = () => {
    // 1. Get latest data from localStorage
    const netWorthData = (() => {
      try {
        const savedData = localStorage.getItem('netWorthData');
        return savedData ? JSON.parse(savedData) : {};
      } catch {
        return {};
      }
    })();

    const futureValueData = (() => {
      try {
        const savedData = localStorage.getItem('future-value-data');
        return savedData ? JSON.parse(savedData) : [];
      } catch {
        return [];
      }
    })();

    // 2. Define the base structure of assets with default ROI and duration
    const defaultAssets = [
      { name: "Home Value", key: "homeValue", roi: 6, duration: 10 },
      { name: "Other Real Estate", key: "otherRealEstate", roi: 7, duration: 10 },
      { name: "Jewellery", key: "jewellery", roi: 4, duration: 10 },
      { name: "Sovereign Gold Bonds", key: "sovereignGoldBonds", roi: 5, duration: 10 },
      { name: "ULIPs Surrender Value", key: "ulipsSurrenderValue", roi: 8, duration: 10 },
      { name: "EPF / PPF / VPF", key: "epfPpfVpf", roi: 7.1, duration: 10 },
      { name: "Fixed Deposits", key: "fixedDeposits", roi: 6.5, duration: 10 },
      { name: "Debt Funds", key: "debtFunds", roi: 7.5, duration: 10 },
      { name: "Domestic Stocks", key: "domesticStocks", roi: 12, duration: 10 },
      { name: "Domestic Mutual Funds", key: "domesticMutualFunds", roi: 11, duration: 10 },
      { name: "International Funds", key: "internationalFunds", roi: 10, duration: 10 },
      { name: "Small Cases", key: "smallCases", roi: 13, duration: 10 },
      { name: "Savings Balance", key: "savingsBalance", roi: 4, duration: 10 },
      { name: "Precious Metals", key: "preciousMetals", roi: 6, duration: 10 },
      { name: "Cryptocurrency", key: "cryptocurrency", roi: 15, duration: 10 },
      { name: "REITs", key: "reits", roi: 9, duration: 10 },
    ];

    // 3. Map over the default structure and merge data
    return defaultAssets.map(defaultAsset => {
      const savedAsset = futureValueData.find((a: Asset) => a.name === defaultAsset.name);

      const currentValue = netWorthData[defaultAsset.key] || 0;
      const roi = savedAsset ? savedAsset.roi : defaultAsset.roi;
      const duration = savedAsset ? savedAsset.duration : defaultAsset.duration;
      const futureValue = calculateFutureValue(currentValue, roi, duration);

      return {
        name: defaultAsset.name,
        currentValue,
        roi,
        duration,
        futureValue,
      };
    });
  };

  const [assets, setAssets] = React.useState<Asset[]>(initializeAssets());
  const [totalFutureValue, setTotalFutureValue] = React.useState(0);

  // Handle input changes
  const handleInputChange = (index: number, field: keyof Asset, value: string) => {
    setAssets(prev => {
      const newAssets = [...prev];
      const updatedAsset = {
        ...newAssets[index],
        [field]: Number(value) || 0
      };

      // Recalculate future value when a relevant field changes
      if (['currentValue', 'roi', 'duration'].includes(field)) {
        updatedAsset.futureValue = calculateFutureValue(
          updatedAsset.currentValue,
          updatedAsset.roi,
          updatedAsset.duration
        );
      }
      
      newAssets[index] = updatedAsset;
      return newAssets;
    });
  };

  // Calculate total future value and save assets to localStorage whenever assets change
  React.useEffect(() => {
    const total = assets.reduce((sum, asset) => sum + asset.futureValue, 0);
    setTotalFutureValue(total);
    localStorage.setItem('future-value-data', JSON.stringify(assets)); // Save to localStorage
  }, [assets]);

  // Export data to JSON file
  const exportData = () => {
    const dataStr = JSON.stringify(assets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'future-value-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from file
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as Asset[];
        setAssets(importedData.map(asset => ({
          ...asset,
          futureValue: calculateFutureValue(asset.currentValue, asset.roi, asset.duration)
        })));
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.removeItem('future-value-data');
    showSuccess("Future Value data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const totalCurrentValue = useMemo(() => assets.reduce((sum, asset) => sum + asset.currentValue, 0), [assets]);

  const averageRoi = useMemo(() => {
    if (totalCurrentValue === 0) {
      return 0;
    }
    const weightedSum = assets.reduce((sum, asset) => sum + asset.currentValue * asset.roi, 0);
    return weightedSum / totalCurrentValue;
  }, [assets, totalCurrentValue]);

  const growth = useMemo(() => {
    if (totalCurrentValue === 0) {
      return 0;
    }
    return ((totalFutureValue / totalCurrentValue) - 1) * 100;
  }, [totalFutureValue, totalCurrentValue]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Future Value Calculator</h1>
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
                  This will reset all ROI and Duration values on this page to their defaults. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Yes, clear data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={exportData}>
            <Upload className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Label htmlFor="import-file">
              <Download className="mr-2 h-4 w-4" /> Import
              <Input 
                id="import-file" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={importData}
              />
            </Label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Asset Future Value Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Value (₹)</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI (%)</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration (Years)</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Future Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {assets.map((asset, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {asset.name}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <Input
                          type="number"
                          value={asset.currentValue}
                          onChange={(e) => handleInputChange(index, 'currentValue', e.target.value)}
                          className="w-full h-8 text-sm"
                          disabled
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <Input
                          type="number"
                          value={asset.roi}
                          onChange={(e) => handleInputChange(index, 'roi', e.target.value)}
                          className="w-full h-8 text-sm"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <Input
                          type="number"
                          value={asset.duration}
                          onChange={(e) => handleInputChange(index, 'duration', e.target.value)}
                          className="w-full h-8 text-sm"
                        />
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium">
                        ₹{asset.futureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Current Value:</span>
                  <span className="font-bold">
                    ₹{totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Average ROI:</span>
                  <span className="font-bold">
                    {averageRoi.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Future Value:</span>
                  <span className="font-bold text-green-600">
                    ₹{totalFutureValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Growth:</span>
                  <span className="font-bold text-green-600">
                    {growth.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FutureValueCalculator;