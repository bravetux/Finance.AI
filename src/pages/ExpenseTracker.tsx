"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet as SheetIcon } from "lucide-react";

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

const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);

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

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SheetIcon className="h-8 w-8" />
          Expense Tracker
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Sheet</CardTitle>
          <CardDescription>
            Track your monthly expenses and see how small changes can impact your budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] min-w-[250px]">Category</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Reduce/Increase</TableHead>
                  <TableHead>1% Change</TableHead>
                  <TableHead>5% Change</TableHead>
                  <TableHead>10% Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={expense.monthlyCost}
                        onChange={(e) => handleCostChange(expense.id, e.target.value)}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={expense.action}
                        onValueChange={(value: Action) => handleActionChange(expense.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Same">Same</SelectItem>
                          <SelectItem value="Reduce">Reduce</SelectItem>
                          <SelectItem value="Increase">Increase</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 1))}</TableCell>
                    <TableCell>{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 5))}</TableCell>
                    <TableCell>{formatCurrency(calculateChange(expense.monthlyCost, expense.action, 10))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell>{formatCurrency(totals.monthlyCost)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatCurrency(totals.change1)}</TableCell>
                  <TableCell>{formatCurrency(totals.change5)}</TableCell>
                  <TableCell>{formatCurrency(totals.change10)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;