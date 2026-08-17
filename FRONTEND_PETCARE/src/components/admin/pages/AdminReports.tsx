// AdminReports.tsx - Placeholder

import React, { useEffect, useState } from "react";
import client from "../../../api";
import "./AdminReports.css";

interface ReportData {
  totalRevenue: number;
  topProduct: string;
  activeUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  averageOrderValue: number;
}

export default function AdminReports() {
  const [data, setData] = useState<ReportData>({
    totalRevenue: 0,
    topProduct: "",
    activeUsers: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await client.get("/api/admin/reports");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load reports", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading reports...</div>;
  }

  return (
    <div className="admin-reports">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Business insights and performance metrics</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card revenue">
          <div className="report-icon">💰</div>
          <div className="report-content">
            <div className="report-label">Total Revenue</div>
            <div className="report-value">₹{data.totalRevenue.toLocaleString()}</div>
            <div className="report-subtitle">All time earnings</div>
          </div>
        </div>

        <div className="report-card product">
          <div className="report-icon">🏆</div>
          <div className="report-content">
            <div className="report-label">Top Product</div>
            <div className="report-value">{data.topProduct || "N/A"}</div>
            <div className="report-subtitle">Best selling item</div>
          </div>
        </div>

        <div className="report-card users">
          <div className="report-icon">👥</div>
          <div className="report-content">
            <div className="report-label">Active Users</div>
            <div className="report-value">{data.activeUsers}</div>
            <div className="report-subtitle">Currently active</div>
          </div>
        </div>

        <div className="report-card appointments">
          <div className="report-icon">📅</div>
          <div className="report-content">
            <div className="report-label">Appointments</div>
            <div className="report-value">{data.totalAppointments}</div>
            <div className="report-subtitle">
              {data.completedAppointments} completed
            </div>
          </div>
        </div>

        <div className="report-card average">
          <div className="report-icon">📊</div>
          <div className="report-content">
            <div className="report-label">Avg Order Value</div>
            <div className="report-value">
              ₹{data.averageOrderValue.toFixed(2)}
            </div>
            <div className="report-subtitle">Per transaction</div>
          </div>
        </div>

        <div className="report-card placeholder">
          <div className="report-icon">📈</div>
          <div className="report-content">
            <div className="report-label">Growth Rate</div>
            <div className="report-value">Coming Soon</div>
            <div className="report-subtitle">Monthly analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
}