// src/pages/vet/components/AppointmentsSection.tsx
import React from "react";
import { Eye } from "lucide-react";
import type { VetAppointment } from "../../../api";
import StatusBadge from "./StatusBadge";

interface AppointmentsSectionProps {
  filteredAppointments: VetAppointment[];
  openActionId: number | null;
  setOpenActionId: (id: number | null) => void;
  handleApprove: (id: number) => void;
  handleReject: (id: number) => void;
  handleComplete: (id: number) => void;
  navigate: any;
}


export default function AppointmentsSection({

  filteredAppointments,
  openActionId,
  setOpenActionId,
  handleApprove,
  handleReject,
  handleComplete,
  navigate
}: AppointmentsSectionProps) {

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const displayed = filteredAppointments.filter((apt) => {
  const s = search.toLowerCase();
  const matchesSearch =
    apt.petName.toLowerCase().includes(s) ||
    apt.ownerName.toLowerCase().includes(s);

  const matchesStatus =
    statusFilter === "ALL" || apt.status === statusFilter;

  return matchesSearch && matchesStatus;
});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
  <div>
    <h1 className="vet-section-title">My Appointments</h1>
    <p className="vet-section-subtitle">Manage your pet appointments and consultations</p>
  </div>

  <div style={{ display: "flex", gap: "10px" }}>
    {/* Search */}
    <input
      type="text"
      placeholder="Search pet or owner..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "0.85rem"
      }}
    />

    {/* Status Filter */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        fontSize: "0.85rem"
      }}
    >
      <option value="ALL">All</option>
      <option value="REQUESTED">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
      <option value="COMPLETED">Completed</option>
    </select>
  </div>
</div>

      <div className="vet-appointments-table-container">
        <table className="vet-appointments-table">
          <thead>
            <tr>
              <th>Pet Name</th>
              <th>Type</th>
              <th>Owner Name</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="vet-table-empty">
                  No appointments found
                </td>
              </tr>
            ) : (
              displayed.map((apt) => (
                <tr key={apt.id}>
                  <td className="vet-table-pet-name">{apt.petName}</td>
                  <td className="vet-table-cell">{apt.petSpecies
  ? apt.petSpecies.charAt(0).toUpperCase() + apt.petSpecies.slice(1).toLowerCase()
  : "Pet"}
</td>
                  <td className="vet-table-cell">{apt.ownerName}</td>
                  <td className="vet-table-cell">
                    {apt.appointmentDate}
                    <br />
                    <span className="vet-table-slot">{apt.slot}</span>
                  </td>
                  <td>
                    <StatusBadge status={apt.status} />
                  </td>
                  <td>
                    {apt.status === "REQUESTED" && (
                      <div className="vet-action-dropdown">
                        <button
                          onClick={() => setOpenActionId(openActionId === apt.id ? null : apt.id)}
                          className="vet-action-btn"
                        >
                          Action ▾
                        </button>

                        {openActionId === apt.id && (
                          <div className="vet-action-menu">
                            <div
                              onClick={() => {
                                handleApprove(apt.id);
                                setOpenActionId(null);
                              }}
                              className="vet-action-item"
                            >
                              ✅ Accept
                            </div>
                            <div
                              onClick={() => {
                                handleReject(apt.id);
                                setOpenActionId(null);
                              }}
                              className="vet-action-item reject"
                            >
                              ❌ Reject
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {apt.status === "APPROVED" && (
                      <div className="vet-action-buttons">
                        <button
                          onClick={() => {
                            if (!apt.petId) {
                              alert("Pet information missing for this appointment");
                              return;
                            }
                            navigate(`/vet/pet/${apt.petId}?appointmentId=${apt.id}`);
                          }}
                          title="View Pet Profile"
                          className="vet-view-btn"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleComplete(apt.id)}
                          className="vet-complete-btn"
                        >
                          Complete
                        </button>
                      </div>
                    )}

                    {apt.status === "REJECTED" && (
                      <span className="vet-status-text rejected">Rejected</span>
                    )}

                    {apt.status === "COMPLETED" && (
                      <span className="vet-status-text completed">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}