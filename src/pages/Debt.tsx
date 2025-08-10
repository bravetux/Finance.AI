"use client";

import React from "react";
import { FileText } from "lucide-react";

const Debt: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <FileText className="h-8 w-8" />
        Debt
      </h1>
      <p className="text-muted-foreground mt-2">This page is under construction.</p>
    </div>
  );
};

export default Debt;