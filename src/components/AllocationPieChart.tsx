"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AllocationData {
  equity: number;
  fds: number;
  bonds: number;
  cash: number;
}

interface AllocationPieChartProps {
  data: AllocationData;
}

const COLORS = {
  equity: "#0088FE",
  fds: "#00C49F",
  bonds: "#FFBB28",
  cash: "#FF8042",
};

const AllocationPieChart: React.FC<AllocationPieChartProps> = ({ data }) => {
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0) // Filter out zero-value entries
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      value,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Allocate assets to see the chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationPieChart;