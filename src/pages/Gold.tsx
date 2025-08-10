"use client";

import React from "react";
import { Gem } from "lucide-react";

const Gold: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Gem className="h-8 w-8" />
        Gold
      </h1>
      <p className="text-muted-foreground mt-2">This page is under construction.</p>
    </div>
  );
};

export default Gold;