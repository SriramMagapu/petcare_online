import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* Build last 6 months */
function buildLast6Months() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      weight: null as number | null,
      temperature: null as number | null,
      notes: null as string | null,
    });
  }
  return months;
}

/* Map records to months */
function mapData(records: any[]) {
  const base = buildLast6Months();

  records.forEach((r) => {
    if (!r.recordedAt) return;

    const d = new Date(r.recordedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const slot = base.find((m) => m.key === key);

    if (slot) {
      if (r.weight != null) slot.weight = r.weight;
      if (r.temperature != null) slot.temperature = r.temperature;
      if (r.notes) slot.notes = r.notes;
    }
  });

  return base;
}

/* Tooltip */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "0.75rem",
        fontSize: "0.85rem",
      }}
    >
      <strong style={{ display: "block", marginBottom: "0.25rem" }}>
        {label}
      </strong>
      {data.weight != null && (
        <div style={{ color: "#2563eb" }}>⚖️ Weight: {data.weight} kg</div>
      )}
      {data.temperature != null && (
        <div style={{ color: "#dc2626" }}>
          🌡️ Temp: {data.temperature} °C
        </div>
      )}
      {data.notes && (
        <div
          style={{
            marginTop: "6px",
            color: "#4b5563",
            fontSize: "0.8rem",
            lineHeight: "1.2rem",
          }}
        >
          📝 {data.notes}
        </div>
      )}
    </div>
  );
};

export default function HealthCombinedChart({ data }: { data: any[] }) {
  const chartData = mapData(data);

  return (
    <div className="chart-visualization">
      <div className="chart-header">
        <h4>📊 Health Trends</h4>
        <p>Weight & temperature over last 6 months</p>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            stroke="#6b7280"
            fontSize={12}
            fontWeight={600}
          />

          {/* LEFT AXIS – WEIGHT */}
          <YAxis
            yAxisId="left"
            stroke="#2563eb"
            fontSize={12}
            label={{
              value: "Weight (kg)",
              angle: -90,
              position: "insideLeft",
            }}
          />

          {/* RIGHT AXIS – TEMPERATURE */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#dc2626"
            fontSize={12}
            label={{
              value: "Temperature (°C)",
              angle: 90,
              position: "insideRight",
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* WEIGHT LINE */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="weight"
            name="Weight (kg)"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            connectNulls
          />

          {/* TEMPERATURE LINE */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
