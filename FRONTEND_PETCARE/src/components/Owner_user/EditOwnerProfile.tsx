import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import {
  apiGetOwnerProfile,
  apiUpdateOwnerProfile,
  type OwnerProfile
} from "../../api";
import "../../styles/editOwnerProfile.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export default function EditOwnerProfile() {
  const [form, setForm] = useState<OwnerProfile>({
    name: "",
    phone: "",
    address: "",
    email: "",
    photoPath: ""
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    apiGetOwnerProfile().then((p) => {
      setForm({
        name: p.name || "",
        phone: p.phone || "",
        address: p.address || "",
        email: p.email || "",
        photoPath: ""
      });
      setLoading(false);
    });
  }, []);

  /* ================= SAVE PROFILE ================= */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiUpdateOwnerProfile(form);

    if (photo) {
      const formData = new FormData();
      formData.append("file", photo);

      await fetch(`${API_BASE}/owner/profile/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        },
        body: formData
      });
    }
    navigate("/owner/profile");
  }

  /* ================= PHOTO HANDLING ================= */
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const getInitials = (name: string) => {
    if (!name) return "PO";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  /* ================= IMAGE URL ================= */
  const profileImage =
    preview ||
    (form.photoPath
      ? `${API_BASE}${
          form.photoPath.startsWith("/uploads")
            ? form.photoPath
            : `/uploads/${form.photoPath}`
        }`
      : null);

  if (loading) {
    return (
      <div className="edit-profile-page">
        <OwnerHeader />
        <div className="edit-page-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="bubble-bg">
        <div className="bubble b1"></div>
        <div className="bubble b2"></div>
      </div>

      <OwnerHeader />

      <div className="edit-page-container">
        <div className="edit-profile-card">
          
          {/* 1. PHOTO SECTION */}
          <div className="card-top-section">
            <div className="photo-section">
              <div className="photo-circle-wrapper" onClick={handlePhotoClick}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="photo-img"
                    alt="Profile"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                
                <div className={`photo-initials ${profileImage ? 'hidden' : ''}`}>
                    {getInitials(form.name)}
                </div>

                {/* Persistent Camera Overlay */}
                <div className="photo-camera-overlay">
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>
              
              <p className="photo-hint">Tap to change photo</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </div>

            <div className="header-text">
              <h1 className="edit-title">Edit Profile</h1>
              <p className="edit-subtitle">Update your details</p>
            </div>
          </div>

          {/* 2. FORM SECTION */}
          <form onSubmit={onSubmit} className="edit-form">
            
            {/* Top Grid: Name & Phone (Side by Side) */}
            <div className="form-grid-top">
              <div className="input-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="field-label">Phone Number</label>
                <input
                  type="tel"
                  className="field-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email Field - Now Full Width (Outside Grid) */}
            <div className="input-group full-width-field">
              <label className="field-label">Email Address</label>
              <input 
                type="email" 
                className="field-input disabled" 
                value={form.email} 
                disabled 
              />
            </div>

            {/* Address Field - Full Width Textarea */}
            <div className="input-group full-width-field">
              <label className="field-label">Address</label>
              <textarea
                className="field-input address-area"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
            
            {/* Actions */}
            <div className="form-actions-row">
                <button type="button" className="btn-cancel" onClick={() => navigate("/owner/profile")}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}