import { useEffect, useState } from "react";
import client, { apiFetchVets, type VetPublic } from "../../api";
import "../../styles/petMedicalHistory.css";

const ALL_SLOTS = ["MORNING", "AFTERNOON", "EVENING"] as const;
// slot display labels
const SLOT_LABELS: Record<string, string> = {
  MORNING: "Morning (9-12)",
  AFTERNOON: "Afternoon (12-5)",
  EVENING: "Evening (5-9)"
};

type FilterType = "ALL" | "PENDING" | "APPROVED" | "PAST";

export default function PetMedicalHistory({ petId }: { petId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vets, setVets] = useState<VetPublic[]>([]);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  // Modal & Form State
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vetId, setVetId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [visitType, setVisitType] = useState<"ONLINE" | "ONSITE">("ONLINE");
  const allSlotsBooked = vetId !== "" && date !== "" && ALL_SLOTS.every((s) => bookedSlots.includes(s));
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    client.get(`/api/pets/${petId}/appointments`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    })
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Failed to load appointments", err));
  }, [petId]);

  useEffect(() => {
    if (!vetId || !date) { setBookedSlots([]); return; }
    setSlot(""); setError(null);
    client.get(`/api/vet/${vetId}/slots`, { params: { date }, headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } })
      .then((res) => setBookedSlots((res.data || []).map((s: string) => s.toUpperCase().trim())))
      .catch(() => setBookedSlots([]));
  }, [vetId, date]);

  const open = async () => {
    setLoading(true); setError(null);
    try { setVets(await apiFetchVets()); setShow(true); }
    catch { alert("Failed to load vets."); }
    finally { setLoading(false); }
  };

  const close = () => { setShow(false); setVetId(""); setDate(""); setSlot(""); setBookedSlots([]); setError(null); };

  const book = async () => {
    if (!vetId || !date || !slot) return;
if (bookedSlots.includes(slot) || rejectedSlots.includes(slot)) {
  setError("Slot unavailable.");
  return;
}
    setLoading(true); setError(null);
    try {
      const res = await client.post("/api/appointments", { petId, vetId, appointmentDate: date, slot, visitType }, { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } });
      setAppointments((prev) => [res.data, ...prev]);
      close();
    } catch (err: any) { setError(err.response?.data?.message || "Booking failed."); }
    finally { setLoading(false); }
  };

  // --- UPDATED FILTER LOGIC ---
  const now = new Date();


  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.appointmentDate);
    // Normalize status to uppercase to be safe
    const status = appt.status ? appt.status.toUpperCase() : "";

    if (activeFilter === "ALL") return true;

    // FIX: Check for both "PENDING" and "REQUESTED"
    if (activeFilter === "PENDING") {
      return status === "PENDING" || status === "REQUESTED";
    }

    if (activeFilter === "APPROVED") {
      return (status === "APPROVED" || status === "CONFIRMED") && apptDate >= now;
    }

    // Past appointments (regardless of status, except pending ones usually)
    if (activeFilter === "PAST") {
      return apptDate < now && status !== "PENDING" && status !== "REQUESTED";
    }

    return true;
  });

  // Sort: Upcoming first
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
  });
  const downloadReport = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await client.get(`/api/appointments/${id}/report`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `medical_report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Report download failed", err);
      alert("Unable to download report. Appointment might not be completed yet.");
    }
  };

  // block Sundays handler
const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const d = new Date(val);

  if (d.getDay() === 0) { 
    setError("Clinic closed on Sundays.");
    setDate("");
    return;
  }

  setError(null);
  setDate(val);
};

const rejectedSlots = appointments
  .filter(a => a.status?.toUpperCase() === "REJECTED" && a.vetId == vetId && a.appointmentDate === date)
  .map(a => a.slot.toUpperCase());


const cancelAppointment = async (id: number) => {
  const confirmCancel = window.confirm("Cancel appointment?");
  if (!confirmCancel) return;

  try {
    const token = sessionStorage.getItem("token");
    await client.delete(`/api/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(prev => prev.filter(a => a.id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to cancel appointment.");
  }
};


  return (
    <div className="pet-medical-history">

      {/* CONTROLS */}
      <div className="history-controls">
        <div className="filter-group">
          <button className={`filter-btn ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>All Appointments</button>
          <button className={`filter-btn ${activeFilter === "PENDING" ? "active" : ""}`} onClick={() => setActiveFilter("PENDING")}>Pending</button>
          <button className={`filter-btn ${activeFilter === "APPROVED" ? "active" : ""}`} onClick={() => setActiveFilter("APPROVED")}>Approved</button>
          <button className={`filter-btn ${activeFilter === "PAST" ? "active" : ""}`} onClick={() => setActiveFilter("PAST")}>Past</button>
        </div>

        <button className="book-appointment-btn" onClick={open} disabled={loading}>
          <i className="fa-solid fa-plus"></i> Book Appointment
        </button>
      </div>

      {/* LIST */}
      <div className="appointments-list">
        {sortedAppointments.length === 0 ? (
          <div className="medical-empty">
            <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '2rem', textAlign: "center", display: 'block', marginBottom: '1rem' }}></i>
            No {activeFilter.toLowerCase()} appointments found.
          </div>
        ) : (
          sortedAppointments.map((appt) => <AppointmentCard key={appt.id} appt={appt} onDownload={downloadReport} onCancel={cancelAppointment} />)
        )}
      </div>

      {/* MODAL (Same as before) */}
      {show && (
        <div className="modal-overlay">
          <div className="booking-card">
            <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Book Appointment</h4>
            {error && <div className="modal-error-banner">{error}</div>}

            <label>Veterinarian</label>
            <select value={vetId} onChange={(e) => setVetId(e.target.value)}>
              <option value="">Choose a vet...</option>
              {vets.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.specialization})</option>)}
            </select>

            <label>Date</label>
            <input type="date" min={todayStr} value={date} onChange={handleDateChange} disabled={!vetId} />

            <label>Time Slot</label>
            <select value={slot} onChange={(e) => { setSlot(e.target.value); setError(null); }} disabled={!vetId || !date || allSlotsBooked} className={allSlotsBooked ? "input-error" : ""}>
              <option value="">{!vetId ? "Select vet first..." : allSlotsBooked ? "No slots available" : "Choose slot..."}</option>
              {ALL_SLOTS.map((s) => (
                <option key={s} value={s} disabled={bookedSlots.includes(s) || rejectedSlots.includes(s)}>
                  {SLOT_LABELS[s]} {bookedSlots.includes(s) || rejectedSlots.includes(s) ? "(Booked)" : ""}
                </option>
              ))}
            </select>
            <label>Visit Type</label>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value as any)}>
              <option value="ONLINE">Online (Video)</option>
              <option value="ONSITE">Onsite (Clinic)</option>
            </select>


            <div className="booking-actions">
              <button onClick={book} disabled={loading || !slot || allSlotsBooked}>{loading ? "Booking..." : "Confirm"}</button>
              <button onClick={close} disabled={loading}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CARD COMPONENT ---
function AppointmentCard({ appt, onDownload, onCancel }: { appt: any, onDownload: (id: number) => void, onCancel: (id: number) => Promise<void> }) {
  const dateObj = new Date(appt.appointmentDate);
  const month = dateObj.toLocaleString("default", { month: "short" });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  const status = appt.status ? appt.status.toUpperCase() : "UNKNOWN";
  const isOnline = appt.visitType === "ONLINE";
  const isOnsite = appt.visitType === "ONSITE";

  let statusClass = "status-completed";
  if (status === "APPROVED" || status === "CONFIRMED") statusClass = "status-approved";
  if (status === "PENDING" || status === "REQUESTED") statusClass = "status-pending";
  if (status === "CANCELLED") statusClass = "status-cancelled";
  if (status === "REJECTED") statusClass = "status-rejected";


  return (
    <div className="appt-card">
      <div className="appt-date-box">
        <span className="date-month">{month}</span>
        <span className="date-day">{day}</span>
        <span style={{ fontSize: '0.65rem', color: 'black', marginTop: '2px' }}>{year}</span>
      </div>

      <div className="appt-info">
        <div className="appt-vet-name">
          {appt.vetName || (appt.vet ? appt.vet.name : "Unknown Vet")}
        </div>
        <div className="appt-specialty">
          {appt.specialization || (appt.vet ? appt.vet.specialization : "Veterinary Physician")}
        </div>

        <div className="appt-meta-row">
          <div className="appt-time">
            <i className="fa-regular fa-clock"></i> {SLOT_LABELS[appt.slot]}
          </div>

          
        </div>
      </div>

      {/* Right Column: Status and Address */}
      <div className="appt-right-col">
        <div className={`appt-status ${statusClass}`}>
          {status}
        </div>

        {/* ACTIONS under status */}
{status === "REQUESTED" && (
  <button
    className="btn-cancel"
    onClick={() => onCancel(appt.id)}
  >
    Cancel Appointment
  </button>
)}

{status === "COMPLETED" && (
  <button
    className="btn-download-report"
    onClick={() => onDownload(appt.id)}
    style={{ marginTop: '6px' }}
  >
    <i className="fa-solid fa-file-arrow-down"></i> Download Report
  </button>
)}

{isOnline && (status === "APPROVED" || status === "CONFIRMED") && (
  <a
    href={appt.meetingLink || "#"}
    target="_blank"
    rel="noreferrer"
    className="btn-join-session"
    style={{ marginTop: '6px' }}
  >
    <i className="fa-solid fa-video"></i> Join Online Session
  </a>
)}

      
        {isOnsite && status === "APPROVED" && (
          <div className="appt-onsite-border-box">
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