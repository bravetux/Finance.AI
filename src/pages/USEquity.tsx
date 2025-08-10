"use client";

import React from "react";
import { Landmark } from "lucide-react";

const USEquity: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Landmark className="h-8 w-8" />
        US Equity
      </h1>
      <p className="text-muted-foreground mt-2">This page is under construction.</p>
    </div>
  );
};

export default USEquity;