"use client";

import React from "react";
import { Home } from "lucide-react";

const RealEstate: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Home className="h-8 w-8" />
        Real Estate
      </h1>
      <p className="text-muted-foreground mt-2">This page is under construction.</p>
    </div>
  );
};

export default RealEstate;