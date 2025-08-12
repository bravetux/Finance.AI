"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Edit, Save, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import GenericPieChart from "@/components/GenericPieChart";
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

interface NetWorthData {
  // Assets - Illiquid
  homeValue: number;
  otherRealEstate: number;
  jewellery: number;
  sovereignGoldBonds: number;
  ulipsSurrenderValue: number;
  epfPpfVpf: number;
  
  // Assets - Liquid
  fixedDeposits: number;
  debtFunds: number;
  domesticStocks: number;
  domesticMutualFunds: number;
  internationalFunds: number;
  smallCases: number;
  savingsBalance: number;
  preciousMetals: number;
  cryptocurrency: number;
  reits: number;
  
  // Liabilities
  homeLoan: number;
  educationLoan: number;
  carLoan: number;
  personalLoan: number;
  creditCardDues: number;
  otherLiabilities: number;
}

const defaultNetWorthData: NetWorthData = {
  homeValue: 0, otherRealEstate: 0, jewellery: 0, sovereignGoldBonds: 0,
  ulipsSurrenderValue: 0, epfPpfVpf: 0, fixedDeposits: 0, debtFunds: 0,
  domesticStocks: 0, domesticMutualFunds: 0, internationalFunds: 0,
  smallCases: 0, savingsBalance: 0, preciousMetals: 0, cryptocurrency: 0,
  reits: 0, homeLoan: 0, educationLoan: 0, carLoan: 0, personalLoan: 0,
  creditCardDues: 0, otherLiabilities: 0
};

const NetWorthCalculator: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [data, setData] = React.useState<NetWorthData>(() => {
    try {
      const savedDataString = localStorage.getItem('netWorthData');
      if (savedDataString) {
        let savedData = JSON.parse(savedDataString);
        
        // Migration logic for old data format
        if ((savedData as any).goldEtf !== undefined) {
          savedData.preciousMetals = savedData.preciousMetals || (savedData as any).goldEtf;
          delete (savedData as any).goldEtf;
        }

        const migratedData = { ...defaultNetWorthData, ...savedData };
        
        // Persist the migrated data back to localStorage immediately
        if (savedDataString !== JSON.stringify(migratedData)) {
            localStorage.setItem('netWorthData', JSON.stringify(migratedData));
        }

        return migratedData;
      }
      return defaultNetWorthData;
    } catch (e) {
      console.error("Failed to load or migrate net worth data from localStorage:", e);
      return defaultNetWorthData;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedData = localStorage.getItem('netWorthData');
        if (savedData) {
          setData(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Failed to reload net worth data from localStorage:", e);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleInputChange = (field: keyof NetWorthData, value: string) => {
    const newData = {
      ...data,
      [field]: Number(value) || 0
    };
    setData(newData);
    localStorage.setItem('netWorthData', JSON.stringify(newData));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'net-worth-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content) as NetWorthData;
        setData(importedData);
        localStorage.setItem('netWorthData', JSON.stringify(importedData)); // Save imported data
      } catch (error) {
        showError('Error parsing file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.setItem('netWorthData', JSON.stringify(defaultNetWorthData));
    showSuccess("Net Worth data has been cleared.");
    setTimeout(() => window.location.reload(), 1000);
  };

  // Calculate totals
  const totalIlliquidAssets = data.homeValue + data.otherRealEstate + data.jewellery + 
                            data.sovereignGoldBonds + data.ulipsSurrenderValue + data.epfPpfVpf;
  const totalLiquidAssets = data.fixedDeposits + data.debtFunds + data.domesticStocks + 
                          data.domesticMutualFunds + data.internationalFunds + data.smallCases + 
                          data.savingsBalance + data.preciousMetals + data.cryptocurrency + data.reits;
  const totalAssets = totalIlliquidAssets + totalLiquidAssets;
  const totalLiabilities = data.homeLoan + data.educationLoan + data.carLoan + 
                         data.personalLoan + data.creditCardDues + data.otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  // Prepare data for charts
  const assetData = [
    { name: "Home", value: data.homeValue },
    { name: "Other Real Estate", value: data.otherRealEstate },
    { name: "Jewellery", value: data.jewellery },
    { name: "Gold Bonds", value: data.sovereignGoldBonds },
    { name: "ULIPs", value: data.ulipsSurrenderValue },
    { name: "EPF/PPF/VPF", value: data.epfPpfVpf },
    { name: "FDs", value: data.fixedDeposits },
    { name: "Debt Funds", value: data.debtFunds },
    { name: "Stocks", value: data.domesticStocks },
    { name: "Mutual Funds", value: data.domesticMutualFunds },
    { name: "Intl Funds", value: data.internationalFunds },
    { name: "Small Cases", value: data.smallCases },
    { name: "Savings", value: data.savingsBalance },
    { name: "Precious Metals", value: data.preciousMetals },
    { name: "Crypto", value: data.cryptocurrency },
    { name: "REITs", value: data.reits },
  ].filter(asset => asset.value > 0);

  const liabilityData = [
    { name: "Home Loan", value: data.homeLoan },
    { name: "Education Loan", value: data.educationLoan },
    { name: "Car Loan", value: data.carLoan },
    { name: "Personal Loan", value: data.personalLoan },
    { name: "Credit Card", value: data.creditCardDues },
    { name: "Other", value: data.otherLiabilities },
  ].filter(liability => liability.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Net Worth Calculator</h1>
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
                  This will reset all fields on this page to zero. This action cannot be undone.
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
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" /> Save
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </>
            )}
          </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Illiquid Assets:</span>
              <span className="font-medium">₹{totalIlliquidAssets.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Liquid Assets:</span>
              <span className="font-medium">₹{totalLiquidAssets.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Assets:</span>
              <span className="font-medium">₹{totalAssets.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Liabilities:</span>
              <span className="font-medium">₹{totalLiabilities.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-between items-center border-t pt-4 mt-4">
            <span className="text-lg font-bold">Net Worth:</span>
            <span className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netWorth.toLocaleString("en-IN")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Illiquid Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Illiquid Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="homeValue">Home Value</Label>
                  <Input
                    id="homeValue"
                    type="number"
                    value={data.homeValue}
                    onChange={(e) => handleInputChange('homeValue', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Real Estate page.</p>
                </div>
                <div>
                  <Label htmlFor="otherRealEstate">Other Real Estate</Label>
                  <Input
                    id="otherRealEstate"
                    type="number"
                    value={data.otherRealEstate}
                    onChange={(e) => handleInputChange('otherRealEstate', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Real Estate page.</p>
                </div>
                <div>
                  <Label htmlFor="jewellery">Jewellery</Label>
                  <Input
                    id="jewellery"
                    type="number"
                    value={data.jewellery}
                    onChange={(e) => handleInputChange('jewellery', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Precious Metals pages.</p>
                </div>
                <div>
                  <Label htmlFor="sovereignGoldBonds">Sovereign Gold Bonds</Label>
                  <Input
                    id="sovereignGoldBonds"
                    type="number"
                    value={data.sovereignGoldBonds}
                    onChange={(e) => handleInputChange('sovereignGoldBonds', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Gold page.</p>
                </div>
                <div>
                  <Label htmlFor="ulipsSurrenderValue">ULIPs Surrender Value</Label>
                  <Input
                    id="ulipsSurrenderValue"
                    type="number"
                    value={data.ulipsSurrenderValue}
                    onChange={(e) => handleInputChange('ulipsSurrenderValue', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="epfPpfVpf">EPF/PPF/VPF</Label>
                  <Input
                    id="epfPpfVpf"
                    type="number"
                    value={data.epfPpfVpf}
                    onChange={(e) => handleInputChange('epfPpfVpf', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Home Value:</span>
                  <span className="font-medium">₹{data.homeValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Real Estate:</span>
                  <span className="font-medium">₹{data.otherRealEstate.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jewellery:</span>
                  <span className="font-medium">₹{data.jewellery.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sovereign Gold Bonds:</span>
                  <span className="font-medium">₹{data.sovereignGoldBonds.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>ULIPs Surrender Value:</span>
                  <span className="font-medium">₹{data.ulipsSurrenderValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>EPF/PPF/VPF:</span>
                  <span className="font-medium">₹{data.epfPpfVpf.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Liquid Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Liquid Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="fixedDeposits">Fixed Deposits</Label>
                  <Input
                    id="fixedDeposits"
                    type="number"
                    value={data.fixedDeposits}
                    onChange={(e) => handleInputChange('fixedDeposits', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="debtFunds">Debt Funds</Label>
                  <Input
                    id="debtFunds"
                    type="number"
                    value={data.debtFunds}
                    onChange={(e) => handleInputChange('debtFunds', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="domesticStocks">Domestic Stocks</Label>
                  <Input
                    id="domesticStocks"
                    type="number"
                    value={data.domesticStocks}
                    onChange={(e) => handleInputChange('domesticStocks', e.target.value)}
                    disabled
                  />
                   <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Domestic Equity page.</p>
                </div>
                <div>
                  <Label htmlFor="domesticMutualFunds">Domestic Mutual Funds</Label>
                  <Input
                    id="domesticMutualFunds"
                    type="number"
                    value={data.domesticMutualFunds}
                    onChange={(e) => handleInputChange('domesticMutualFunds', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Mutual Fund Allocation page.</p>
                </div>
                <div>
                  <Label htmlFor="internationalFunds">International Funds</Label>
                  <Input
                    id="internationalFunds"
                    type="number"
                    value={data.internationalFunds}
                    onChange={(e) => handleInputChange('internationalFunds', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smallCases">Small Cases</Label>
                  <Input
                    id="smallCases"
                    type="number"
                    value={data.smallCases}
                    onChange={(e) => handleInputChange('smallCases', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="savingsBalance">Savings Balance</Label>
                  <Input
                    id="savingsBalance"
                    type="number"
                    value={data.savingsBalance}
                    onChange={(e) => handleInputChange('savingsBalance', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="preciousMetals">Precious Metals</Label>
                  <Input
                    id="preciousMetals"
                    type="number"
                    value={data.preciousMetals}
                    onChange={(e) => handleInputChange('preciousMetals', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground pt-1">This value is auto-populated from the Precious Metals pages.</p>
                </div>
                <div>
                  <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
                  <Input
                    id="cryptocurrency"
                    type="number"
                    value={data.cryptocurrency}
                    onChange={(e) => handleInputChange('cryptocurrency', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reits">REITs</Label>
                  <Input
                    id="reits"
                    type="number"
                    value={data.reits}
                    onChange={(e) => handleInputChange('reits', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Fixed Deposits:</span>
                  <span className="font-medium">₹{data.fixedDeposits.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Debt Funds:</span>
                  <span className="font-medium">₹{data.debtFunds.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domestic Stocks:</span>
                  <span className="font-medium">₹{data.domesticStocks.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domestic Mutual Funds:</span>
                  <span className="font-medium">₹{data.domesticMutualFunds.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>International Funds:</span>
                  <span className="font-medium">₹{data.internationalFunds.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Small Cases:</span>
                  <span className="font-medium">₹{data.smallCases.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Balance:</span>
                  <span className="font-medium">₹{data.savingsBalance.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precious Metals:</span>
                  <span className="font-medium">₹{data.preciousMetals.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cryptocurrency:</span>
                  <span className="font-medium">₹{data.cryptocurrency.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>REITs:</span>
                  <span className="font-medium">₹{data.reits.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="homeLoan">Home Loan</Label>
                  <Input
                    id="homeLoan"
                    type="number"
                    value={data.homeLoan}
                    onChange={(e) => handleInputChange('homeLoan', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="educationLoan">Education Loan</Label>
                  <Input
                    id="educationLoan"
                    type="number"
                    value={data.educationLoan}
                    onChange={(e) => handleInputChange('educationLoan', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="carLoan">Car Loan</Label>
                  <Input
                    id="carLoan"
                    type="number"
                    value={data.carLoan}
                    onChange={(e) => handleInputChange('carLoan', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="personalLoan">Personal Loan</Label>
                  <Input
                    id="personalLoan"
                    type="number"
                    value={data.personalLoan}
                    onChange={(e) => handleInputChange('personalLoan', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="creditCardDues">Credit Card Dues</Label>
                  <Input
                    id="creditCardDues"
                    type="number"
                    value={data.creditCardDues}
                    onChange={(e) => handleInputChange('creditCardDues', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="otherLiabilities">Other Liabilities</Label>
                  <Input
                    id="otherLiabilities"
                    type="number"
                    value={data.otherLiabilities}
                    onChange={(e) => handleInputChange('otherLiabilities', e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Home Loan:</span>
                  <span className="font-medium">₹{data.homeLoan.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education Loan:</span>
                  <span className="font-medium">₹{data.educationLoan.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Car Loan:</span>
                  <span className="font-medium">₹{data.carLoan.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Personal Loan:</span>
                  <span className="font-medium">₹{data.personalLoan.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Card Dues:</span>
                  <span className="font-medium">₹{data.creditCardDues.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Liabilities:</span>
                  <span className="font-medium">₹{data.otherLiabilities.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-4 ${totalLiabilities > 0 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <GenericPieChart data={assetData} />
          </CardContent>
        </Card>
        {totalLiabilities > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Liability Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericPieChart data={liabilityData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NetWorthCalculator;