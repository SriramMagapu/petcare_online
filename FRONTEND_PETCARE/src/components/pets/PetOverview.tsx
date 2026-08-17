// src/components/pets/PetOverview.tsx

import { useEffect, useRef, useState } from "react";
import {
  apiGetPet,
  apiUpdatePet,
  apiUploadPetPhoto,
  type Pet,
} from "../../api";
import "../../styles/petOverview.css";
import { getImageUrl } from "../../utils/imageUrl";

/* ================= TYPES ================= */

type PetForm = Pet & {
  healthStatus?: string;
};

type EditablePetField =
  | "name"
  | "species"
  | "breed"
  | "gender"
  | "dob"
  | "healthStatus";

/* ================= COMPONENT ================= */

export default function PetOverview({
  petId,
  onUpdated,
}: {
  petId: string;
  onUpdated: (p: Pet) => void;
}) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<PetForm | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const [imageVersion, setImageVersion] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const IMAGE_URL = getImageUrl(pet?.photoPath, "/pet-placeholder.png");

  /* ================= LOAD PET ================= */
  useEffect(() => {
    apiGetPet(petId).then((p) => {
      setPet(p);
      setForm(p);
      setImageVersion(Date.now());
    });
  }, [petId]);

  if (!pet || !form) return null;

  /* ================= CHANGE HANDLER ================= */
  function handleChange(field: EditablePetField, value: string) {
    if (form) {
      setForm({ ...form, [field]: value });
    }
  }

  /* ================= AGE CALCULATION ================= */
  function calculateAge(dob?: string) {
    if (!dob) return "—";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "—";
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years <= 0 && months <= 0) return "Less than 1 month";
    if (years <= 0) return `${months} month${months > 1 ? "s" : ""}`;
    if (months <= 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!form) return;
    try {
      const updated = await apiUpdatePet(petId, form);
      if (photo) {
        await apiUploadPetPhoto(petId, photo);
        setImageVersion(Date.now());
      }
      setPet(updated);
      setForm(updated);
      onUpdated(updated);
      setEditMode(false);
      setPhoto(null);
    } catch (err) {
      console.error("Failed to update pet", err);
    }
  }

  return (
    <div className={`pet-overview-container ${editMode ? "edit-active" : ""}`}>
      {/* HEADER */}
      <div className="overview-top-bar">
        <h2 className="overview-title">Overview</h2>
        {!editMode && (
          <button className="overview-edit-btn" onClick={() => setEditMode(true)}>
            <i className="fa-solid fa-pen-to-square"></i> Edit Profile
          </button>
        )}
      </div>

      {/* PHOTO + BASIC INFO */}
      <div className="overview-top-row">
        {/* PHOTO */}
        <div className={`overview-photo ${editMode ? "editable" : ""}`}>
          <img src={IMAGE_URL} alt={pet.name} />
          <div className="photo-fallback">{pet.name.charAt(0).toUpperCase()}</div>

          {/* --- NEW: ALWAYS VISIBLE LOW OPACITY CAM ICON IN EDIT MODE --- */}
          {editMode && (
            <div className="photo-edit-indicator">
                 <i className="fa-solid fa-camera"></i>
            </div>
          )}

          {/* --- HOVER OVERLAY (Actual Click Target) --- */}
          {editMode && (
            <label className="photo-upload-overlay">
              <i className="fa-solid fa-camera"></i>
              <span>Tap to change photo</span>
              <input
                type="file" hidden accept="image/*" ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setPhoto(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = document.querySelector(".overview-photo img") as HTMLImageElement;
                    if (img && ev.target?.result) img.src = ev.target.result as string;
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          )}
        </div>

        {/* INFO */}
        <div className="overview-info">
          <h3 className="section-heading">Basic Information</h3>
          <div className="info-grid">
            <InfoField label="Pet Name" value={form.name} editMode={editMode} onChange={(v) => handleChange("name", v)} />
            <InfoField label="Species" value={form.species || ""} editMode={editMode} onChange={(v) => handleChange("species", v)} />
            <InfoField label="Breed" value={form.breed || ""} editMode={editMode} onChange={(v) => handleChange("breed", v)} />
            <div className="info-card">
              <span className="info-card-label">Gender</span>
              {editMode ? (
                <select 
                  className="edit-input edit-select"
                  value={form.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              ) : (
                <p className="info-card-value" style={{textTransform: 'capitalize'}}>{form.gender?.toLowerCase() || "—"}</p>
              )}
            </div>
            <InfoField label="Date of Birth" value={form.dob || ""} type="date" editMode={editMode} onChange={(v) => handleChange("dob", v)} />
            <InfoField label="Age" value={calculateAge(form.dob)} editMode={false} />
          </div>
        </div>
      </div>

      {/* HEALTH STATUS */}
      <div className="overview-section">
        <h3 className="section-heading">Health Status</h3>
        {editMode ? (
          <textarea
            className="health-textarea"
            value={form.healthStatus || ""}
            onChange={(e) => handleChange("healthStatus", e.target.value)}
            placeholder="Enter health notes here..."
          />
        ) : (
          <div className="health-box">{pet.healthStatus || "No health notes provided"}</div>
        )}
      </div>

      {/* ACTIONS */}
      {editMode && (
        <div className="edit-actions">
          <button className="btn-cancel" onClick={() => { setEditMode(false); setForm(pet); setPhoto(null); }}>Cancel</button>
          <button className="btn-save" onClick={save}>Save Changes</button>
        </div>
      )}
    </div>
  );
}

/* ================= INFO FIELD ================= */

function InfoField({ label, value, editMode, onChange, type = "text" }: { label: string; value: string; editMode: boolean; onChange?: (v: string) => void; type?: string; }) {
  return (
    <div className={`info-card ${editMode ? "editing" : ""}`}>
      <span className="info-card-label">{label}</span>
      {editMode && onChange ? (
        <input type={type} className="edit-input" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <p className="info-card-value">{value || "—"}</p>
      )}
    </div>
  );
}