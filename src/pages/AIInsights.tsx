"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const AIInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Insights
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Financial Summary</CardTitle>
          <CardDescription>
            This page will provide AI-driven insights and summaries of your financial data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center bg-muted/50 rounded-lg">
            <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              AI Insights are coming soon!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for automated analysis of your financial health.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;