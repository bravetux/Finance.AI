"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CashflowSummary: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cashflow Summary</h1>
      <Card>
        <CardHeader>
          <CardTitle>Summary Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the summary page for Cashflow Planning. Content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashflowSummary;