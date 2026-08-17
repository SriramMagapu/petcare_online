import React, { useEffect, useState } from "react";
import client from "../../../api";
import "./AdminUsers.css";

import OwnerDetailModal from "../components/OwnerDetailModal";
import VetDetailModal from "../components/VetDetailModal";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "OWNER" | "VET";
  createdAt: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "OWNER" | "VET">("ALL");

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<"OWNER" | "VET" | null>(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await client.get("/api/admin/users/overview");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      ((u.name ?? "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)) && 
      (filterRole === "ALL" || u.role === filterRole)
    );
  });

  if (loading) return <div className="loading-state">Loading users…</div>;

  return (
    <div className="admin-users-page">
      {/* Compact Header attached to the top section */}
      <div className="compact-page-header">
        <h2>User Management</h2>
        <div className="header-controls">
           <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              className="search-input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="role-filters">
            {(["ALL", "OWNER", "VET"] as const).map((role) => (
              <button
                key={role}
                className={`filter-btn ${filterRole === role ? "active" : ""}`}
                onClick={() => setFilterRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Details</th>
              <th>Role</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td className="user-id">#{u.id}</td>
                <td>
                  <div className="user-info">
                    <span className="user-name">{u.name || "N/A"}</span>
                    <span className="user-email">{u.email}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td className="date-cell">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setSelectedRole(u.role);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRole === "OWNER" && selectedUserId && (
        <OwnerDetailModal userId={selectedUserId} onClose={() => {setSelectedUserId(null); setSelectedRole(null);}} />
      )}

      {selectedRole === "VET" && selectedUserId && (
        <VetDetailModal userId={selectedUserId} onClose={() => {setSelectedUserId(null); setSelectedRole(null);}} />
      )}
    </div>
  );
}