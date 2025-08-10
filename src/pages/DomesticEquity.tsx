"use client";

import React from "react";
import { BarChart2 } from "lucide-react";

const DomesticEquity: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BarChart2 className="h-8 w-8" />
        Domestic Equity
      </h1>
      <p className="text-muted-foreground mt-2">This page is under construction.</p>
    </div>
  );
};

export default DomesticEquity;