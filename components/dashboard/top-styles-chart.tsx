"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardStyleBreakdownResponse } from "@/lib/api/types";

interface TopStylesChartProps {
  data: DashboardStyleBreakdownResponse;
  title: string;
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#94a3b8", // Slate (usually for Other)
];

export function TopStylesChart({ data, title }: TopStylesChartProps) {
  const chartData = useMemo(() => {
    return data.slices.map((slice, index) => ({
      name: slice.style_name,
      value: parseFloat(slice.revenue),
      percentage: parseFloat(slice.revenue_share),
      fill: slice.style_id === null ? "#94a3b8" : COLORS[index % (COLORS.length - 1)],
    }));
  }, [data]);

  const currencySymbol = data.currency === "EUR" ? "€" : data.currency;

  if (data.slices.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">No style data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any, props: any) => [
                `${currencySymbol}${Number(value).toFixed(2)} (${props.payload.percentage}%)`,
                name
              ]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
