"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PieChartEntry {
  name: string;
  value: number;
}

interface GenericPieChartProps {
  data: PieChartEntry[];
}

// Function to generate a list of distinct colors
const generateColors = (numColors: number) => {
  const colors = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560",
    "#775DD0", "#00E396", "#FEB019", "#FF4560", "#546E7A", "#26a69a",
    "#D10CE8", "#FF66C3", "#2B908F", "#F9A3A4", "#90EE7E", "#FA4443",
    "#69D2E7", "#A7DB8D", "#E91E63", "#5C4742", "#A5978B", "#8D5B4C"
  ];
  
  while (colors.length < numColors) {
    colors.push(`#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`);
  }
  return colors;
};

const GenericPieChart: React.FC<GenericPieChartProps> = ({ data }) => {
  const chartData = data.filter(entry => entry.value > 0);
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data to display.
      </div>
    );
  }

  const COLORS = generateColors(chartData.length);

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
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GenericPieChart;