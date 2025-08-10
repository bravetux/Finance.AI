"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const Transactions: React.FC = () => {
  const transactions = [
    { id: "1", date: "2023-10-26", description: "Groceries", amount: -75.50, type: "Expense" },
    { id: "2", date: "2023-10-25", description: "Salary", amount: 2500.00, type: "Income" },
    { id: "3", date: "2023-10-24", description: "Coffee Shop", amount: -5.25, type: "Expense" },
    { id: "4", date: "2023-10-23", description: "Freelance Work", amount: 500.00, type: "Income" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                    ₹{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;