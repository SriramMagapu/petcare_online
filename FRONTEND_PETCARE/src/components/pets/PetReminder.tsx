import { useEffect, useState } from "react";
import client from "../../api";
import "../../styles/petMedicalHistory.css";

// slot labels (reuse from PetMedicalHistory)
const SLOT_LABELS: Record<string, string> = {
  MORNING: "Morning (9-12)",
  AFTERNOON: "Afternoon (12-5)",
  EVENING: "Evening (5-9)"
};

export default function PetReminder({ petId }: { petId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    client.get(`/api/pets/${petId}/appointments`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    })
      .then(res => setAppointments(res.data))
      .catch(err => console.error("Failed to load appointments", err));
  }, [petId]);

  const now = new Date();

  const approved = appointments
    .filter((appt) => {
      const status = appt.status ? appt.status.toUpperCase() : "";
      const apptDate = new Date(appt.appointmentDate);
      return (status === "APPROVED" || status === "CONFIRMED") && apptDate >= now;
    })
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return (
    <div className="pet-medical-history">
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.75rem" }}>
        Upcoming Appointments
      </h3>

      <div className="appointments-list">
        {approved.length === 0 ? (
          <div className="reminders-placeholder">
  <i className="fa-solid fa-bell placeholder-icon"></i>
  <h3>Reminders Coming Soon</h3>
  <p>Set up reminders for appointments, medications, and more.</p>
</div>

        ) : (
          approved.map((appt) => <ReminderCard key={appt.id} appt={appt} />)
        )}
      </div>
    </div>
  );
}

function ReminderCard({ appt }: { appt: any }) {
  const dateObj = new Date(appt.appointmentDate);
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  const isOnline = appt.visitType === "ONLINE";
  const isOnsite = appt.visitType === "ONSITE";

  return (
    <div className="appt-card">
      <div className="appt-date-box">
        <span className="date-month">{month}</span>
        <span className="date-day">{day}</span>
        <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px' }}>{year}</span>
      </div>

      <div className="appt-info">
        <div className="appt-vet-name">{appt.vetName}</div>
        <div className="appt-specialty">{appt.specialization}</div>

        <div className="appt-meta-row">
          <div className="appt-time">
            <i className="fa-regular fa-clock"></i> {SLOT_LABELS[appt.slot]}
          </div>
        </div>
      </div>

      <div className="appt-right-col">
        <div className="appt-status status-approved">APPROVED</div>

        {isOnline && (
          <a
            href={appt.meetingLink || "#"}
            target="_blank"
            rel="noreferrer"
            className="btn-join-session"
            style={{ marginTop: '6px' }}
          >
            <i className="fa-solid fa-video"></i> Join Session
          </a>
        )}

        {isOnsite && (
          <div className="appt-onsite-border-box" style={{ marginTop: '6px' }}>
            <div className="onsite-item">
              <i className="fa-solid fa-location-dot"></i> <span>{appt.clinicAddress || "Visit Clinic"}</span>
            </div>
            <div className="onsite-item">
              <i className="fa-solid fa-phone"></i> <span>{appt.vetPhone || "Clinic Phone"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
