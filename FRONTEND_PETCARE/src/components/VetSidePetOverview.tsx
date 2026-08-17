import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  Syringe,
  FileText,
  CheckCircle,
  Hash,
  User as UserIcon,
  Dna,
  Stethoscope,
  CalendarDays,
  ShieldCheck
} from "lucide-react";
import client from "../api";
import { getImageUrl } from "../utils/imageUrl";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dob: string;
  microchipId: string;
  ownerId: number;
  healthStatus: string;
  photoPath?: string;
  ownerName: string;
}

interface Overview {
  pet: Pet;
  medicalHistory: Array<{ diagnosis: string; date: string; vetName: string }>;
  vaccinations: Array<{ vaccineName: string; date: string; nextDue: string }>;
  ownerName: string;
}

export default function VetSidePetOverview() {
  const { petId } = useParams<{ petId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get("appointmentId");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canComplete = note.trim().length > 0;

  useEffect(() => {
    if (!petId || petId === "null") {
      setError("Invalid pet selected");
      setLoading(false);
      return;
    }

    client.get(`/api/pets/${petId}/overview/vet`)
      .then((res) => {
        setOverview(res.data);
        setPet(res.data.pet);
        console.log("overview ->", overview);

        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load pet clinical data");
        setLoading(false);
      });
  }, [petId]);

  async function saveNotesAndComplete() {
    if (!appointmentId) return;
    try {
      await client.put(`/api/appointments/${appointmentId}/notes`, note, { headers: { "Content-Type": "text/plain" } });
      await client.put(`/api/appointments/${appointmentId}/complete`);
      alert("Consultation finalized successfully ✓");
      navigate(-1);
    } catch (err) {
      alert("Error finalizing appointment");
    }
  }

  if (loading) return <div style={styles.centerBox}>Loading Pet Medical Records...</div>;
  if (error || !pet || !overview) return <div style={styles.errorBox}>{error}</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.mainCard}>
        
        {/* TOP NAVIGATION BAR */}
        <div style={styles.navRow}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Appointments
          </button>
          <div style={styles.badge}>Clinical Pet Overview</div>
        </div>

        {/* PET HERO SECTION */}
        <div style={styles.heroSection}>
          <div style={styles.photoContainer}>
            <img
              src={getImageUrl(pet.photoPath, "/pet-placeholder.png")}
              alt={pet.name}
              style={styles.petPhoto}
            />
          </div>
          <div style={styles.heroText}>
            <h1 style={styles.petName}>{pet.name}</h1>
            <div style={styles.idBadge}><Hash size={14} /> ID: {pet.id}</div>
            
            <div style={styles.gridInfo}>
              <DetailBox icon={<Dna size={16}/>} label="Species" value={pet.species} color="#EEF2FF" textColor="#4338CA" />
              <DetailBox icon={<ShieldCheck size={16}/>} label="Breed" value={pet.breed} color="#F0FDF4" textColor="#166534" />
              <DetailBox icon={<UserIcon size={16}/>} label="Gender" value={pet.gender} color="#FFF1F2" textColor="#9F1239" />
              <DetailBox icon={<CalendarDays size={16}/>} label="DOB" value={pet.dob} color="#FDF4FF" textColor="#701A75" />
              <DetailBox icon={<UserIcon size={16}/>} label="Owner Name" value={overview.ownerName} color="#F1F5F9" textColor="#334155" />
            </div>
          </div>
        </div>

        {/* MAIN DATA GRID */}
        <div style={styles.contentGrid}>
          
          {/* LEFT COLUMN: VET INPUT */}
          <div style={styles.inputColumn}>
            <div style={styles.sectionHeader}>
              <FileText size={20} color="#6366F1" />
              <h3 style={styles.sectionTitle}>Consultation Notes</h3>
            </div>
            
            <div style={styles.ownerNoteBox}>
              <label style={styles.labelSmall}>Owner's Reported Health Status</label>
              <p style={styles.statusText}>"{pet.healthStatus || "Normal condition reported by owner."}"</p>
            </div>

            <label style={styles.labelBold}>Diagnosis & Treatment Plan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter clinical observations, prescribed medications, and follow-up advice..."
              style={styles.textarea}
            />

            <button
              disabled={!canComplete}
              onClick={saveNotesAndComplete}
              style={{
                ...styles.completeBtn,
                background: canComplete ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "#E2E8F0",
                cursor: canComplete ? "pointer" : "not-allowed",
              }}
            >
              <CheckCircle size={20} /> Finalize Appointment
            </button>
          </div>

          {/* RIGHT COLUMN: HISTORY */}
          <div style={styles.historyColumn}>
            
            {/* MEDICAL HISTORY */}
            <section style={styles.historySection}>
              <div style={styles.sectionHeader}>
                <Activity size={20} color="#EF4444" />
                <h3 style={styles.sectionTitle}>Medical Records</h3>
              </div>
              <div style={styles.scrollArea}>
                {overview.medicalHistory.length === 0 ? (
                  <p style={styles.emptyText}>No previous clinical history.</p>
                ) : (
                  overview.medicalHistory.map((m, i) => (
                    <div key={i} style={styles.historyItem}>
                      <div style={styles.diagText}>{m.diagnosis}</div>
                      <div style={styles.metaText}>{m.date} • Dr. {m.vetName}</div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* VACCINATIONS */}
            <section style={styles.historySection}>
              <div style={styles.sectionHeader}>
                <Syringe size={20} color="#10B981" />
                <h3 style={styles.sectionTitle}>Vaccination History</h3>
              </div>
              <div style={styles.scrollArea}>
                {overview.vaccinations.length === 0 ? (
                  <p style={styles.emptyText}>No vaccination records found.</p>
                ) : (
                  overview.vaccinations.map((v, i) => (
                    <div key={i} style={styles.vaxItem}>
                      <div style={styles.vaxTitle}>{v.vaccineName}</div>
                      <div style={styles.vaxDate}>Administered: {v.date}</div>
                      {v.nextDue && <div style={styles.vaxDue}>Boost Due: {v.nextDue}</div>}
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for pet stats
function DetailBox({ icon, label, value, color, textColor }: any) {
  return (
    <div style={{ ...styles.detailBox, backgroundColor: color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: textColor }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: textColor, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{value || "—"}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    padding: "40px 20px",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
    display: "flex",
    justifyContent: "center"
  },
  mainCard: {
    width: "100%",
    maxWidth: "1200px",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
    border: "1px solid #F1F5F9",
    padding: "32px",
    overflow: "hidden"
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    background: "#FFF",
    color: "#64748B",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s"
  },
  badge: {
    padding: "6px 14px",
    background: "#EEF2FF",
    color: "#6366F1",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 700
  },
  heroSection: {
    display: "flex",
    gap: "32px",
    paddingBottom: "32px",
    borderBottom: "1px solid #F1F5F9",
    marginBottom: "32px",
    alignItems: "center"
  },
  photoContainer: {
    width: "160px",
    height: "160px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  petPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  heroText: { flex: 1 },
  petName: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#0F172A",
    margin: 0
  },
  idBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#94A3B8",
    fontSize: "14px",
    marginTop: "4px",
    marginBottom: "20px"
  },
  gridInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px"
  },
  detailBox: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(0,0,0,0.03)"
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "40px"
  },
  inputColumn: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#1E293B", margin: 0 },
  ownerNoteBox: {
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "16px",
    borderLeft: "4px solid #CBD5E1"
  },
  labelSmall: { fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" },
  statusText: { fontSize: "14px", fontStyle: "italic", color: "#475569", margin: "8px 0 0 0" },
  labelBold: { fontSize: "14px", fontWeight: 700, color: "#1E293B", marginTop: "12px" },
  textarea: {
    width: "100%",
    minHeight: "180px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    outline: "none",
    fontSize: "15px",
    lineHeight: "1.6",
    fontFamily: "inherit"
  },
  completeBtn: {
    marginTop: "12px",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    color: "#FFF",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "0.3s"
  },
  historyColumn: { display: "flex", flexDirection: "column", gap: "32px" },
  scrollArea: { maxHeight: "300px", overflowY: "auto", paddingRight: "8px" },
  historyItem: {
    padding: "12px",
    background: "#FFF",
    border: "1px solid #F1F5F9",
    borderRadius: "12px",
    marginBottom: "10px"
  },
  diagText: { fontWeight: 600, color: "#1E293B", fontSize: "14px" },
  metaText: { fontSize: "12px", color: "#94A3B8", marginTop: "4px" },
  vaxItem: {
    padding: "12px",
    background: "#F0FDF4",
    borderRadius: "12px",
    border: "1px solid #DCFCE7",
    marginBottom: "10px"
  },
  vaxTitle: { fontWeight: 700, color: "#166534", fontSize: "14px" },
  vaxDate: { fontSize: "12px", color: "#15803D" },
  vaxDue: { fontSize: "11px", fontWeight: 700, color: "#059669", marginTop: "4px" },
  emptyText: { color: "#94A3B8", textAlign: "center", padding: "20px" },
  centerBox: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" },
  errorBox: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }
};