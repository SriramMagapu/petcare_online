import React, { useEffect, useState } from "react";
import client from "../../../api";
import "./AdminVetApproval.css";

// Define proper interfaces to fix TypeScript "any" errors
interface VetProfile {
  name: string;
  specialization: string;
  approved: boolean;
  certificatePath?: string;
}

interface VetUser {
  id: number;
  email: string;
  role: string;
  vetProfile?: VetProfile;
}

export default function AdminVetApproval() {
  const [vets, setVets] = useState<VetUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await client.get("/api/admin/users/overview");
      // Filter for Vets who actually have a profile filled out
      const onlyVets = res.data.filter(
        (u: VetUser) => u.role === "VET" && u.vetProfile
      );
      setVets(onlyVets);
    } catch (e) {
      console.error("Failed to load vets", e);
    } finally {
      setLoading(false);
    }
  }

  async function approve(userId: number) {
    try {
      await client.put(`/api/admin/vets/${userId}/approve`);
      await load(); // Reload data after approval
    } catch (e) {
      console.error("Approval failed", e);
    }
  }

  async function block(userId: number) {
    try {
      await client.put(`/api/admin/vets/${userId}/block`);
      await load(); // Reload data after blocking
    } catch (e) {
      console.error("Blocking failed", e);
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "V";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fixed filtering logic to combine search and category filters
  const filteredVets = vets.filter((v) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
        ? !v.vetProfile?.approved
        : v.vetProfile?.approved;

    const matchesSearch =
      v.vetProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: vets.length,
    pending: vets.filter((v) => !v.vetProfile?.approved).length,
    approved: vets.filter((v) => v.vetProfile?.approved).length,
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="admin-vet-approval">
      {/* Compact Header to prevent scrolling overlap */}
      <div className="compact-vet-header">
        <div className="header-left-info">
          <h2>Vet Approvals</h2>
          <p>Verify veterinarian credentials</p>
        </div>

        <div className="header-right-tools">
          <div className="search-bar-container">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats row with high-contrast metric values */}
      <div className="vet-stats-mini-grid">
        <div className="mini-stat-card total">
          <span className="mini-val">{stats.total}</span>
          <span className="mini-lbl">Total Vets</span>
        </div>
        <div className="mini-stat-card pending">
          <span className="mini-val">{stats.pending}</span>
          <span className="mini-lbl">Pending Review</span>
        </div>
        <div className="mini-stat-card approved">
          <span className="mini-val">{stats.approved}</span>
          <span className="mini-lbl">Approved</span>
        </div>
      </div>

      {/* Filter Tab bar - pill style */}
      <div className="filter-navigation-bar">
        <button className={`nav-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`nav-pill ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending</button>
        <button className={`nav-pill ${filter === "approved" ? "active" : ""}`} onClick={() => setFilter("approved")}>Approved</button>
      </div>

      <div className="vets-grid-container">
        {filteredVets.map((v) => (
          <div key={v.id} className="professional-vet-card">
            <div className="card-top">
              <span className={`badge ${v.vetProfile?.approved ? "approved" : "pending"}`}>
                {v.vetProfile?.approved ? "Approved" : "Pending"}
              </span>
            </div>

            <div className="avatar-circle">{getInitials(v.vetProfile?.name)}</div>

            <h3>{v.vetProfile?.name || "Dr. Anonymous"}</h3>
            <p className="email-sub">{v.email}</p>

            <div className="info-block">
              <div className="info-row">
                <i className="fa-solid fa-stethoscope"></i>
                <span>{v.vetProfile?.specialization || "General Medicine"}</span>
              </div>
              <div className="info-row certificate-status">
  <i className="fa-solid fa-file-shield"></i>
  {v.vetProfile?.certificatePath ? (
    <a
      href={`/uploads/${v.vetProfile.certificatePath}`}
      target="_blank"
      rel="noopener noreferrer"
      className="certificate-link"
    >
      View Certificate
    </a>
  ) : (
    <span className="certificate-missing">No Document</span>
  )}
</div>

            </div>

            <div className="card-actions">
              {!v.vetProfile?.approved && (
                <button className="btn-approve" onClick={() => approve(v.id)}>
                  Approve Vet
                </button>
              )}
              <button className="btn-block" onClick={() => block(v.id)}>
                Block
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}