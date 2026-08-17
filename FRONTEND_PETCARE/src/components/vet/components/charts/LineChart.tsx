// src/pages/vet/components/charts/LineChart.tsx
import React from "react";

interface LineChartData {
  month: string;
  count: number;
}

interface LineChartProps {
  data: LineChartData[];
}

export default function LineChart({ data }: LineChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const width = 400;
  const height = 250;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const barWidth = chartWidth / data.length;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />
      
      {data.map((d, i) => {
        const barHeight = (d.count / maxCount) * chartHeight;
        const x = padding + i * barWidth + barWidth / 4;
        const y = height - padding - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth / 2} height={barHeight} fill="#3b82f6" />
            <text x={x + barWidth / 4} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#6b7280">
              {d.month}
            </text>
            <text x={x + barWidth / 4} y={y - 5} textAnchor="middle" fontSize="11" fill="#111827" fontWeight="bold">
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}