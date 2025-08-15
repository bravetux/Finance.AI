"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartHandshake } from "lucide-react";

const FIDOK: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HeartHandshake className="h-8 w-8" />
          FIDOK (Financial Information & Documents Of Kin)
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to FIDOK</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is intended to store and manage crucial financial information and documents for your next of kin. It ensures that in case of an emergency, your loved ones have access to all the necessary details.</p>
          <p className="mt-4 text-muted-foreground">This feature is currently under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FIDOK;