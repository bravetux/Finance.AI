"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet as SheetIcon, Upload, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveAs } from "file-saver";
import { showSuccess, showError } from "@/utils/toast";
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

type Action = "Same" | "Reduce" | "Increase";

interface ExpenseItem {
  id: string;
  category: string;
  monthlyCost: number;
  action: Action;
}

const initialExpenses: ExpenseItem[] = [
  { id: '1', category: 'Rent/ EMI for home', monthlyCost: 0, action: 'Same' },
  { id: '2', category: 'Car/2W EMI + Maintenance + Insurance', monthlyCost: 0, action: 'Same' },
  { id: '3', category: 'Car + Bike Petrol', monthlyCost: 500, action: 'Reduce' },
  { id: '4', category: 'Personal Loan/Credit Card Expense/ Both', monthlyCost: 400, action: 'Same' },
  { id: '5', category: 'Local Travel', monthlyCost: 500, action: 'Same' },
  { id: '6', category: 'Food (Resturants+Swiggy+Zomato)', monthlyCost: 1000, action: 'Same' },
  { id: '7', category: 'Grocery (Market+App Delivery)', monthlyCost: 15000, action: 'Same' },
  { id: '8', category: 'House Help + Cleaning Services Availed', monthlyCost: 5000, action: 'Same' },
  { id: '9', category: 'Electricity + Gas', monthlyCost: 2000, action: 'Same' },
  { id: '10', category: 'Movies/ OTT', monthlyCost: 0, action: 'Same' },
  { id: '11', category: 'Wi-Fi & Mobile Recharge', monthlyCost: 1500, action: 'Same' },
  { id: '12', category: 'Grooming/ Personal Hygine', monthlyCost: 50, action: 'Same' },
  { id: '13', category: 'Apparels/ Footwear/ Accessories', monthlyCost: 0, action: 'Same' },
  { id: '14', category: 'Child School + Extracurriculars', monthlyCost: 9000, action: 'Same' },
  { id: '15', category: 'Healthcare', monthlyCost: 1000, action: 'Same' },
  { id: '16', category: 'Electronics (Laptop, Mobile, AC, TV, Washing Machine)', monthlyCost: 0, action: 'Reduce' },
  { id: '17', category: '1 International/Domestic Trip', monthlyCost: 0, action: 'Same' },
  { id: '18', category: 'Broker + Shifting + Home deposit interest', monthlyCost: 0, action: 'Same' },
];

const ExpenseReductionPlanner: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const savedData = localStorage.getItem('expenseTrackerData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to load expense data from localStorage:", error);
    }
    return initialExpenses;
  });

  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerData', JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expense data to localStorage:", error);
    }
  }, [expenses]);

  const handleCostChange = (id: string, value: string) => {
    const newExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, monthlyCost: Number(value) || 0 } : expense
    );
    setExpenses(newExpenses);
  };

  const handleActionChange = (id: string, value: Action) => {
    const newExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, action: value } : expense
    );
    setExpenses(newExpenses);
  };

  const calculateChange = (cost: number, action: Action, percentage: number) => {
    if (action === 'Reduce') {
      return cost * (1 - percentage / 100);
    }
    if (action === 'Increase') {
      return cost * (1 + percentage / 100);
    }
    return cost;
  };

  const totals = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc.monthlyCost += expense.monthlyCost;
        acc.change1 += calculateChange(expense.monthlyCost, expense.action, 1);
        acc.change5 += calculateChange(expense.monthlyCost, expense.action, 5);
        acc.change10 += calculateChange(expense.monthlyCost, expense.action, 10);
        return acc;
      },
      { monthlyCost: 0, change1: 0, change5: 0, change10: 0 }
    );
  }, [expenses]);

  const chartData = useMemo(() => {
    return expenses
      .filter(expense => expense.monthlyCost > 0)
      .map(expense => ({
        name: expense.category,
        value: expense.monthlyCost,
      }));
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(expenses, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      saveAs(blob, "expense-tracker-data.json");
      showSuccess("Expense data exported successfully!");
    } catch (error) {
      showError("Failed to export data.");
      console.error("Export error:", error);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData) && importedData.every(item => 'id' in item && 'category' in item && 'monthlyCost' in item && 'action' in item)) {
          setExpenses(importedData);
          showSuccess("Expense data imported successfully!");
        } else {
          throw new Error("Invalid file format.");
        }
      } catch (error) {
        showError("Error parsing file. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearData = () => {
    const clearedExpenses = expenses.map(expense => ({
      ...expense,
      monthlyCost: 0,
      action: 'Same' as Action,
    }));
    setExpenses(clearedExpenses);
    showSuccess("All expense fields have been cleared.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SheetIcon className="h-8 w-8" />
          Expense Reduction Planner
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
                  This will reset all expense data on this page to its default state. This action cannot be undone.
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
            <Label htmlFor="import-file" className="cursor-pointer">
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
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>
            A visual representation of your monthly expenses by category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenericPieChart data={chartData} showLegend={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Reduction Planner</CardTitle>
          <CardDescription>
            Reduce your monthly expenses and see how small changes can impact your budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] p-2">Category</TableHead>
                  <TableHead className="p-2">Cost</TableHead>
                  <TableHead className="p-2">Action</TableHead>
                  <TableHead className="p-2 text-right">±1%</TableHead>
                  <TableHead className="p-2 text-right">±5%</TableHead>
                  <TableHead className="p-2 text-right">±10%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium p-2">{expense.category}</TableCell>
                    <TableCell className="p-0">
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          value={expense.monthlyCost}
                          onChange={(e) => handleCostChange(expense.id, e.target.value)}
                          className="w-28 border-0 rounded-none focus-visible:ring-1 focus-visible:ring-offset-0 p-2 pl-6 h-auto bg-transparent text-right"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-0">
                      <Select
                        value={expense.action}
                        onValueChange={(value: Action) => handleActionChange(expense.id, value)}
                      >
                        <SelectTrigger className="w-[120px] border-0 rounded-none focus:ring-1 focus:ring-offset-0 p-2 h-auto bg-transparent">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Same">Same</SelectItem>
                          <SelectItem value="Reduce">Reduce</SelectItem>
                          <SelectItem value="Increase">Increase</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-2 text-right">{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 1))}</TableCell>
                    <TableCell className="p-2 text-right">{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 5))}</TableCell>
                    <TableCell className="p-2 text-right">{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 10))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell className="p-2">Total Expenses</TableCell>
                  <TableCell className="p-2 text-right">{formatCurrency(totals.monthlyCost)}</TableCell>
                  <TableCell className="p-2"></TableCell>
                  <TableCell className="p-2 text-right">{formatCurrency(totals.change1)}</TableCell>
                  <TableCell className="p-2 text-right">{formatCurrency(totals.change5)}</TableCell>
                  <TableCell className="p-2 text-right">{formatCurrency(totals.change10)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseReductionPlanner;