import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../api";
import "./AdminDashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface User {
  vetProfile: { approved: boolean } | null;
  id: number;
  email: string;
  role: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await client.get("/api/admin/users/overview");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  }

  const totalUsers = users.length;
  const pendingVets = users.filter(
  (u) => u.role === "VET" && u.vetProfile && !u.vetProfile.approved
).length;
  const activeOwners = users.filter((u) => u.role === "OWNER").length;

  const registrationData = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach((u) => {
      if (!u.createdAt) return;
      const date = u.createdAt.split("T")[0];
      if (date) {
        map[date] = (map[date] || 0) + 1;
      }
    });
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, count: map[d] }));
  }, [users]);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-body">
        <div className="dashboard-intro">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Manage your pet care system performance
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <h3 className="stat-value">{totalUsers}</h3>
          </div>

          <div className="stat-card">
            <span className="stat-label">Pending Vets</span>
            <h3 className="stat-value">{pendingVets}</h3>
          </div>

          <div className="stat-card">
            <span className="stat-label">Active Owners</span>
            <h3 className="stat-value">{activeOwners}</h3>
          </div>
        </div>

        <div className="action-section">
          <h3 className="section-title">Action Required</h3>

          <div className="action-grid">
            <div className="action-card">
              <h4>Vet Approvals</h4>
              <p>{pendingVets} vets waiting for approval</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/admin/vets")}
              >
                Review Vets
              </button>
            </div>

            <div className="action-card">
              <h4>User Management</h4>
              <p>{totalUsers} registered users found</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/admin/users")}
              >
                Manage Users
              </button>
            </div>

            <div className="action-card">
              <h4>Order Tracking</h4>
              <p>View recent and active orders</p>
              <button
                className="btn-primary"
                onClick={() => navigate("/admin/orders")}
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3 className="section-title">User Registration Trend</h3>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}