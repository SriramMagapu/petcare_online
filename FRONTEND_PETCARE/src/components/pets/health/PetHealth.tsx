import { useEffect, useState } from "react";
import { apiGetMeasurements, apiAddMeasurement } from "../../../api";
import HealthForm from "./HealthForm";
import HealthCombinedChart from "./HealthCombinedChart";
import "../../../styles/petHealth.css";

type Props = {
  petId: string;
};

export default function PetHealth({ petId }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [petId]);

  async function load() {
    setLoading(true);
    const res = await apiGetMeasurements(petId);
    setRecords(res);
    setLoading(false);
  }

  async function onAdd(record: any) {
    await apiAddMeasurement(petId, record);
    await load();
  }

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  return (
    <section className="pet-health-section">
      {/* HEADER */}
      <div className="health-header">
        <h3 className="health-title">🩺 Health Tracking</h3>
        <p className="health-subtitle">
          Monitor your pet&apos;s vital signs and growth
        </p>
      </div>

      {/* STATS */}
      {latestRecord && (
        <div className="health-stats">
          <div className="stat-card weight">
            <div className="stat-icon">⚖️</div>
            <div className="stat-content">
              <span className="stat-label">Current Weight</span>
              <span className="stat-value">{latestRecord.weight} kg</span>
            </div>
          </div>

          <div className="stat-card temperature">
            <div className="stat-icon">🌡️</div>
            <div className="stat-content">
              <span className="stat-label">Last Temperature</span>
              <span className="stat-value">
                {latestRecord.temperature} °C
              </span>
            </div>
          </div>

          <div className="stat-card records">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-label">Total Records </span>
              <span className="stat-value">{records.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="health-content">
        {/* LEFT: FORM */}
        <div className="health-form-container">
          <div className="form-header">
            <h4>📝 Add Health Record</h4>
            <p>Track weight, temperature, and notes</p>
          </div>
          <HealthForm onSubmit={onAdd} />
        </div>

        {/* RIGHT: COMBINED CHART */}
        <div className="health-charts-container">
          {loading ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="chart-empty">
              <div className="empty-icon">📊</div>
              <h4>No Health Data Yet</h4>
              <p>Add your first health record to see trends</p>
            </div>
          ) : (
            <HealthCombinedChart data={records} />
          )}
        </div>
      </div>
    </section>
  );
}
