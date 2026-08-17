type Appointment = {
  id: number;
  appointmentDate: string;
  slot: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  vetName?: string;
  specialization?: string;
  vetNotes?: string;
  meetingLink?: string; // ✅ added
};

export default function Timeline({
  appointments
}: {
  appointments: Appointment[];
}) {
  if (!appointments || appointments.length === 0) {
    return <p style={{ marginTop: 24 }}>No medical history yet</p>;
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h3>🩺 Medical History</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {appointments.map((a) => (
          <div
            key={a.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff"
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8
              }}
            >
              <div>
                <strong>{a.vetName || "Veterinarian"}</strong>
                {a.specialization && (
                  <span style={{ color: "#6b7280", marginLeft: 6 }}>
                    ({a.specialization})
                  </span>
                )}
              </div>

              <StatusBadge status={a.status} />
            </div>

            {/* DATE + SLOT */}
            <div style={{ fontSize: 14, color: "#374151" }}>
              📅 {a.appointmentDate} — 🕒 {a.slot}
            </div>

            {/* ✅ MEETING LINK (only when approved) */}
            {a.status === "APPROVED" && a.meetingLink && (
              <div style={{ marginTop: 12 }}>
                <a
                  href={a.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: "#ecfeff",
                    color: "#0369a1",
                    fontWeight: 500,
                    textDecoration: "none",
                    border: "1px solid #bae6fd"
                  }}
                >
                  🔗 Join Online Session
                </a>
              </div>
            )}

            {/* NOTES */}
            {a.status === "COMPLETED" && a.vetNotes && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb"
                }}
              >
                <strong>Doctor’s Notes</strong>
                <p style={{ marginTop: 6 }}>{a.vetNotes}</p>
              </div>
            )}

            {a.status === "REJECTED" && (
              <p style={{ marginTop: 8, color: "#991b1b" }}>
                ❌ Appointment was rejected by the vet
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STATUS BADGE ===================== */

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    REQUESTED: { text: "Pending", bg: "#fef3c7", color: "#92400e" },
    APPROVED: { text: "Approved", bg: "#d1fae5", color: "#065f46" },
    COMPLETED: { text: "Completed", bg: "#dbeafe", color: "#1e40af" },
    REJECTED: { text: "Rejected", bg: "#fee2e2", color: "#991b1b" }
  };

  const s = map[status];

  return (
    <span
      style={{
        padding: "4px 12px",
        fontSize: 12,
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontWeight: 500
      }}
    >
      {s.text}
    </span>
  );
}
