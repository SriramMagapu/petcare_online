// src/pages/vet/components/DashboardHome.tsx
import React from "react";
import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";
import type { VetProfileData, DashboardStats, VetAppointment } from "../../../api";
import StatCard from "./StatCard";
import PieChart from "./charts/PieChart";
import LineChart from "./charts/LineChart";

interface DashboardHomeProps {
  profile: VetProfileData | null;
  stats: DashboardStats;
  appointments: VetAppointment[];
}

export default function DashboardHome({
  profile,
  stats,
  appointments,
}: DashboardHomeProps) {

  const getMonthlyData = () => {
    const now = new Date();

    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d.toLocaleString("en-US", { month: "short" });
    });

    const monthCounts = new Array(6).fill(0);

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      if (isNaN(aptDate.getTime())) return;

      const diff =
        (now.getFullYear() - aptDate.getFullYear()) * 12 +
        (now.getMonth() - aptDate.getMonth());

      if (diff >= 0 && diff < 6) {
        monthCounts[5 - diff]++;
      }
    });

    return months.map((month, i) => ({
      month,
      count: monthCounts[i],
    }));
  };

  const pieData = [
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "Accepted", value: stats.accepted, color: "#10b981" },
    { label: "Completed", value: stats.completed, color: "#8b5cf6" },
  ];

  const hasAnyData = pieData.some(d => d.value > 0);

  return (
    <div>
      <h1 className="vet-section-title">Dashboard</h1>
      <p className="vet-section-subtitle">
        Welcome back, {profile?.name}. Here's your appointment overview
      </p>

      <div className="vet-stats-grid">
        <StatCard 
          title="TOTAL CASES" 
          value={stats.total} 
          color="#3b82f6" 
          icon={<Activity size={28} />} 
        />
        <StatCard 
          title="PENDING" 
          value={stats.pending} 
          color="#f59e0b" 
          icon={<Clock size={28} />} 
        />
        <StatCard 
          title="ACCEPTED" 
          value={stats.accepted} 
          color="#10b981" 
          icon={<CheckCircle size={28} />} 
        />
        <StatCard 
          title="COMPLETED" 
          value={stats.completed} 
          color="#8b5cf6" 
          icon={<CheckCircle size={28} />} 
        />
      </div>

      <div className="vet-charts-grid">
        <div className="vet-chart-card">
          <h3 className="vet-chart-title">Status Distribution</h3>
          <div className="vet-chart-container">
            {hasAnyData ? (
              <PieChart data={pieData} />
            ) : (
              <div className="vet-chart-no-data">
                No appointments yet
              </div>
            )}
          </div>
        </div>

        <div className="vet-chart-card">
          <h3 className="vet-chart-title">Appointment Growth (Last 6 Months)</h3>
          <LineChart data={getMonthlyData()} />
        </div>
      </div>
    </div>
  );
}