import React from "react";

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

// ✅ INTERNAL TYPE FOR CALCULATED SLICES
interface PieSlice extends PieChartData {
  startAngle: number;
  angle: number;
}

interface PieChartProps {
  data: PieChartData[];
}

export default function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <div className="vet-chart-no-data">No data available</div>;
  }

  const nonZero = data.filter(d => d.value > 0);

  // ✅ SINGLE SLICE → FULL CIRCLE
  if (nonZero.length === 1) {
    const slice = nonZero[0]!;

    return (
      <div className="vet-pie-chart">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill={slice.color} />
        </svg>

        <div className="vet-pie-legend">
          <div className="vet-legend-item">
            <div
              className="vet-legend-color"
              style={{ background: slice.color }}
            />
            <span className="vet-legend-text">
              {slice.label} ({slice.value})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MULTI SLICE CASE (TYPED)
  let currentAngle = 0;

  const slices: PieSlice[] = data.map((d): PieSlice => {
    const angle = (d.value / total) * 360;

    const slice: PieSlice = {
      ...d,
      startAngle: currentAngle,
      angle,
    };

    currentAngle += angle;
    return slice;
  });

  return (
    <div className="vet-pie-chart">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map((slice, i) => {
          const start = (slice.startAngle - 90) * Math.PI / 180;
          const end = (slice.startAngle + slice.angle - 90) * Math.PI / 180;

          const x1 = 100 + 80 * Math.cos(start);
          const y1 = 100 + 80 * Math.sin(start);
          const x2 = 100 + 80 * Math.cos(end);
          const y2 = 100 + 80 * Math.sin(end);

          const largeArc = slice.angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={slice.color}
            />
          );
        })}
      </svg>

      <div className="vet-pie-legend">
        {data.map((d, i) => (
          <div key={i} className="vet-legend-item">
            <div
              className="vet-legend-color"
              style={{ background: d.color }}
            />
            <span className="vet-legend-text">
              {d.label} ({d.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
