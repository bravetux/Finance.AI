"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, Upload, Download, Trash2, Fuel, Shield, Wrench, Wallet } from "lucide-react";
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
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CarInputs {
  annualIncome: number;
  incomeTax: number;
  priceOfVehicle: number;
  roadTax: number;
  downpayment: number;
  loanTenure: number;
  interestRate: number;
  monthlyDriving: number;
  mileage: number;
  fuelPrice: number;
  lifespan: number;
  insurancePremium: number;
  maintenanceCost: number;
  parkingExpenses: number;
  tollExpenses: number;
  annualSalaryHike: number;
  costInflation: number;
}

const initialInputs: CarInputs = {
  annualIncome: 1600000,
  incomeTax: 0,
  priceOfVehicle: 1500000,
  roadTax: 100000,
  downpayment: 320000,
  loanTenure: 5,
  interestRate: 9.5,
  monthlyDriving: 300,
  mileage: 14,
  fuelPrice: 110,
  lifespan: 15,
  insurancePremium: 9000,
  maintenanceCost: 10000,
  parkingExpenses: 0,
  tollExpenses: 3000,
  annualSalaryHike: 4,
  costInflation: 6,
};

const CarAffordableCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CarInputs>(() => {
    try {
      const saved = localStorage.getItem('carAffordableCalculatorData');
      return saved ? { ...initialInputs, ...JSON.parse(saved) } : initialInputs;
    } catch {
      return initialInputs;
    }
  });

  useEffect(() => {
    localStorage.setItem('carAffordableCalculatorData', JSON.stringify(inputs));
  }, [inputs]);

  const handleInputChange = (field: keyof CarInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const calculations = useMemo(() => {
    const { annualIncome, incomeTax, priceOfVehicle, roadTax, downpayment, loanTenure, interestRate, monthlyDriving, mileage, fuelPrice, lifespan, insurancePremium, maintenanceCost, parkingExpenses, tollExpenses } = inputs;

    const annualNetIncome = annualIncome - incomeTax;
    const onRoadPrice = priceOfVehicle + roadTax;
    const loanAmount = Math.max(0, onRoadPrice - downpayment);
    
    const monthlyInterestRate = (interestRate / 100) / 12;
    const loanTenureMonths = loanTenure * 12;
    const emiAmount = loanAmount > 0 && monthlyInterestRate > 0 && loanTenureMonths > 0
      ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTenureMonths)) / (Math.pow(1 + monthlyInterestRate, loanTenureMonths) - 1)
      : 0;

    const fuelCostPerYear = (monthlyDriving * 12 / Math.max(1, mileage)) * fuelPrice;
    const fuelCostOverLifespan = fuelCostPerYear * lifespan;

    const totalInsuranceCost = insurancePremium * lifespan;
    const totalMaintenanceCost = maintenanceCost * lifespan;
    const totalParkingCost = parkingExpenses * lifespan;
    const totalTollCost = tollExpenses * lifespan;

    const totalBuyingCostWithEMI = (emiAmount * loanTenureMonths) + downpayment;
    const totalRunningCost = fuelCostOverLifespan;
    const totalInsuranceMaintenanceCost = totalInsuranceCost + totalMaintenanceCost;
    const totalAdditionalCosts = totalParkingCost + totalTollCost;
    const totalOwnershipCost = totalBuyingCostWithEMI + totalRunningCost + totalInsuranceMaintenanceCost + totalAdditionalCosts;

    const annualOperatingCost = fuelCostPerYear + insurancePremium + maintenanceCost + parkingExpenses + tollExpenses;
    const totalAnnualCost = annualOperatingCost + (emiAmount * 12);
    
    const isAffordable = annualNetIncome > 0 ? totalAnnualCost <= (annualNetIncome * 0.15) : false;

    const fuelCostPerMonth = (monthlyDriving / Math.max(1, mileage)) * fuelPrice;
    const insuranceCostPerMonth = insurancePremium / 12;
    const additionalCostPerMonth = (maintenanceCost + parkingExpenses + tollExpenses) / 12;
    const monthlyTotalExpenses = emiAmount + fuelCostPerMonth + insuranceCostPerMonth + additionalCostPerMonth;

    return {
      annualNetIncome, onRoadPrice, loanAmount, emiAmount, fuelCostPerYear,
      totalBuyingCostWithEMI, totalRunningCost, totalInsuranceMaintenanceCost,
      totalAdditionalCosts, totalOwnershipCost, totalAnnualCost, isAffordable,
      fuelCostPerMonth, insuranceCostPerMonth, additionalCostPerMonth, monthlyTotalExpenses
    };
  }, [inputs]);

  const projectionCalculations = useMemo(() => {
    const { lifespan, loanTenure, annualSalaryHike, costInflation } = inputs;
    const { annualNetIncome, emiAmount, fuelCostPerYear } = calculations;
    
    const projections = [];
    let currentNetIncome = annualNetIncome;
    let currentRunningCost = fuelCostPerYear;
    let currentInsuranceMaintenance = inputs.insurancePremium + inputs.maintenanceCost;
    let currentAdditionalCost = inputs.parkingExpenses + inputs.tollExpenses;

    for (let year = 1; year <= lifespan; year++) {
      const annualEmi = year <= loanTenure ? emiAmount * 12 : 0;
      const totalCost = annualEmi + currentRunningCost + currentInsuranceMaintenance + currentAdditionalCost;
      const percentOfNetIncome = currentNetIncome > 0 ? (totalCost / currentNetIncome) * 100 : 0;

      projections.push({
        year,
        netIncome: currentNetIncome,
        purchaseCost: annualEmi,
        runningCost: currentRunningCost,
        insuranceMaintenance: currentInsuranceMaintenance,
        additionalCost: currentAdditionalCost,
        totalCost,
        percentOfNetIncome,
      });

      currentNetIncome *= (1 + annualSalaryHike / 100);
      currentRunningCost *= (1 + costInflation / 100);
      currentInsuranceMaintenance *= (1 + costInflation / 100);
      currentAdditionalCost *= (1 + costInflation / 100);
    }
    return projections;
  }, [inputs, calculations]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(inputs, null, 2)], { type: 'application/json' });
    saveAs(blob, 'car-calculator-data.json');
    showSuccess('Car calculator data exported!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        setInputs({ ...initialInputs, ...data });
        showSuccess('Data imported successfully!');
      } catch (err) {
        showError('Failed to parse the file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    setInputs(initialInputs);
    showSuccess('All fields have been reset.');
  };

  const renderInputField = (label: string, field: keyof CarInputs, value: number) => (
    <div className="space-y-1">
      <Label htmlFor={field}>{label}</Label>
      <Input id={field} type="number" value={value} onChange={e => handleInputChange(field, e.target.value)} />
    </div>
  );

  const renderInfoField = (label: string, value: string) => (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Car className="h-8 w-8" />Car Affordability Calculator</h1>
        <div className="flex gap-2">
          <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will reset all fields to their default values.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleClearData}>Yes, clear</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
          <Button variant="outline" onClick={exportData}><Upload className="mr-2 h-4 w-4" /> Export</Button>
          <Button variant="outline" asChild><Label htmlFor="import-file" className="cursor-pointer"><Download className="mr-2 h-4 w-4" /> Import<Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} /></Label></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Fuel Cost Per Month</CardTitle><Fuel className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(calculations.fuelCostPerMonth)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Insurance Cost Per Month</CardTitle><Shield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(calculations.insuranceCostPerMonth)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Additional Cost Per Month</CardTitle><Wrench className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(calculations.additionalCostPerMonth)}</div><p className="text-xs text-muted-foreground">Maintenance, Parking, Tolls</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monthly Total Expenses</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(calculations.monthlyTotalExpenses)}</div><p className="text-xs text-muted-foreground">EMI + All Monthly Costs</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Basic Car & Loan Details</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderInputField("Annual Income", "annualIncome", inputs.annualIncome)}{renderInputField("Income Tax", "incomeTax", inputs.incomeTax)}{renderInputField("Price of Vehicle (Ex-Showroom)", "priceOfVehicle", inputs.priceOfVehicle)}{renderInputField("Road Tax + Others", "roadTax", inputs.roadTax)}{renderInputField("Expected Downpayment", "downpayment", inputs.downpayment)}{renderInputField("Loan Tenure (Years)", "loanTenure", inputs.loanTenure)}{renderInputField("Interest Rate on Loan (%)", "interestRate", inputs.interestRate)}<div className="md:col-span-2 space-y-2 border-t pt-4">{renderInfoField("Annual Net Income:", formatCurrency(calculations.annualNetIncome))}{renderInfoField("On-Road Price:", formatCurrency(calculations.onRoadPrice))}{renderInfoField("Loan Amount:", formatCurrency(calculations.loanAmount))}{renderInfoField("EMI Amount:", formatCurrency(calculations.emiAmount))}</div></CardContent></Card>
        <div className="space-y-6"><Card><CardHeader><CardTitle>Running, Insurance & Maintenance</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderInputField("Monthly Driving (km)", "monthlyDriving", inputs.monthlyDriving)}{renderInputField("Car Mileage (km/l)", "mileage", inputs.mileage)}{renderInputField("Fuel Price (per litre)", "fuelPrice", inputs.fuelPrice)}{renderInputField("Car Lifespan (Years)", "lifespan", inputs.lifespan)}{renderInputField("Annual Insurance Premium", "insurancePremium", inputs.insurancePremium)}{renderInputField("Annual Maintenance Cost", "maintenanceCost", inputs.maintenanceCost)}{renderInputField("Annual Parking Expenses", "parkingExpenses", inputs.parkingExpenses)}{renderInputField("Annual Toll Expenses", "tollExpenses", inputs.tollExpenses)}</CardContent></Card></div>
      </div>

      <Card><CardHeader><CardTitle>Ownership Summary (Over {inputs.lifespan} Years)</CardTitle></CardHeader><CardContent className="space-y-2">{renderInfoField("Total Buying Cost (with EMI interest):", formatCurrency(calculations.totalBuyingCostWithEMI))}{renderInfoField("Total Running Cost (Fuel):", formatCurrency(calculations.totalRunningCost))}{renderInfoField("Total Insurance + Maintenance:", formatCurrency(calculations.totalInsuranceMaintenanceCost))}{renderInfoField("Total Additional Costs (Parking, Tolls):", formatCurrency(calculations.totalAdditionalCosts))}<div className="flex justify-between items-center border-t pt-2 mt-2"><span className="text-lg font-bold">Total Cost of Ownership:</span><span className="text-xl font-bold">{formatCurrency(calculations.totalOwnershipCost)}</span></div></CardContent></Card>
      
      <Card className={calculations.isAffordable ? "bg-green-50 dark:bg-green-900/30 border-green-500" : "bg-red-50 dark:bg-red-900/30 border-red-500"}>
        <CardHeader><CardTitle>Verdict</CardTitle></CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-lg">Annual Cost of Owning a Car (EMI + Running Costs): <strong className="text-2xl">{formatCurrency(calculations.totalAnnualCost)}</strong></p>
          <p className={`text-4xl font-bold ${calculations.isAffordable ? 'text-green-600' : 'text-red-600'}`}>{calculations.isAffordable ? "Affordable" : "Not Affordable"}</p>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground space-y-1 w-full">
            <p><strong>How affordability is calculated:</strong></p>
            <ul className="list-disc pl-4 text-left">
              <li>A common financial guideline is that your total car expenses (EMI, fuel, insurance, maintenance) should not exceed 15-20% of your monthly take-home pay. This calculator uses the 15% rule for its verdict.</li>
              <li>As your salary increases over time and your loan is paid off, the affordability percentage (Total Cost / Net Income) should decrease, as shown in the projection table below.</li>
            </ul>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ownership Cost Projection (With Salary Hike & Inflation)</CardTitle>
          <CardDescription>This table projects your car ownership costs over its entire lifespan, factoring in inflation and your salary growth.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {renderInputField("Annual Salary Hike (%)", "annualSalaryHike", inputs.annualSalaryHike)}
            {renderInputField("Annual Cost Inflation (%)", "costInflation", inputs.costInflation)}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Net Income (+{inputs.annualSalaryHike}% yearly)</TableHead>
                  <TableHead>Purchase Cost (EMIs)</TableHead>
                  <TableHead>Running Cost (+{inputs.costInflation}% yearly)</TableHead>
                  <TableHead>Insurance + Maintenance (+{inputs.costInflation}% yearly)</TableHead>
                  <TableHead>Additional Cost (+{inputs.costInflation}% yearly)</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>% of Net Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectionCalculations.map(p => (
                  <TableRow key={p.year}>
                    <TableCell>{p.year}</TableCell>
                    <TableCell>{formatCurrency(p.netIncome)}</TableCell>
                    <TableCell>{formatCurrency(p.purchaseCost)}</TableCell>
                    <TableCell>{formatCurrency(p.runningCost)}</TableCell>
                    <TableCell>{formatCurrency(p.insuranceMaintenance)}</TableCell>
                    <TableCell>{formatCurrency(p.additionalCost)}</TableCell>
                    <TableCell>{formatCurrency(p.totalCost)}</TableCell>
                    <TableCell>{p.percentOfNetIncome.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatCurrency(projectionCalculations.reduce((s, p) => s + p.purchaseCost, 0))}</TableCell>
                  <TableCell>{formatCurrency(projectionCalculations.reduce((s, p) => s + p.runningCost, 0))}</TableCell>
                  <TableCell>{formatCurrency(projectionCalculations.reduce((s, p) => s + p.insuranceMaintenance, 0))}</TableCell>
                  <TableCell>{formatCurrency(projectionCalculations.reduce((s, p) => s + p.additionalCost, 0))}</TableCell>
                  <TableCell>{formatCurrency(projectionCalculations.reduce((s, p) => s + p.totalCost, 0))}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarAffordableCalculator;