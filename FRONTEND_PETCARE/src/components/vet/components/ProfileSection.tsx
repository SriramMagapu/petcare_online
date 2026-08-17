import { useEffect, useState } from "react";
import { Camera, Phone, MapPin, Building2, Award, Calendar, Users } from "lucide-react";
import client from "../../../api";
import "./VetProfile.css";
import { getImageUrl } from "../../../utils/imageUrl";

interface VetProfile {
  name: string;
  clinicName: string;
  specialization: string;
  phone: string;
  clinicAddress: string;
  photoPath?: string;
  certificatePath?: string;
  approved: boolean;
}

export default function VetProfile() {
  const [profile, setProfile] = useState<VetProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [imgVersion, setImgVersion] = useState(Date.now());
  const [photoHover, setPhotoHover] = useState(false);

  const loadProfile = async () => {
    const res = await client.get("/api/vet/profile");
    setProfile(res.data);
    setForm(res.data);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    await client.put("/api/vet/profile", {
      name: form.name,
      clinicName: form.clinicName,
      specialization: form.specialization,
      phone: form.phone,
      clinicAddress: form.clinicAddress,
    });
    setEdit(false);
    loadProfile();
  };

  const uploadPhoto = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await client.post("/api/vet/profile/photo", fd);
    setImgVersion(Date.now());
    loadProfile();
  };

  const uploadCertificate = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await client.post("/api/vet/profile/certificate", fd);
    loadProfile();
  };

  if (!profile) return (
    <div className="vetprof-loading">
      <div className="vetprof-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );

  return (
    <div className="vetprof-wrapper">
      <div className="vetprof-container">
        {/* Main Profile Card */}
        <div className="vetprof-card">
          {/* Avatar Section */}
          <div className="vetprof-avatar-section">
            <div
              className="vetprof-avatar-wrap"
              onMouseEnter={() => setPhotoHover(true)}
              onMouseLeave={() => setPhotoHover(false)}
            >
              <img
                src={getImageUrl(profile.photoPath, "/default-vet.png")}
                alt="Vet"
                className="vetprof-avatar"
              />

              {/* Camera Overlay */}
              <div className={`vetprof-camera-overlay ${photoHover ? "vetprof-camera-visible" : ""}`}>
                <label className="vetprof-camera-label">
                  <Camera size={32} className="vetprof-camera-icon" />
                  <input
                    type="file"
                    accept="image/*"
                    className="vetprof-hidden-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(f);
                    }}
                  />
                </label>
              </div>

              {/* Status Badge */}
              <span
                className={`vetprof-status-badge ${
                  profile.approved ? "vetprof-approved" : "vetprof-pending"
                }`}
                title={profile.approved ? "Verified Veterinarian" : "Pending Approval"}
              >
                {profile.approved ? "✓" : "⏱"}
              </span>
            </div>
          </div>

          {/* Profile Content */}
          {!edit ? (
            <div className="vetprof-content">
              <h2 className="vetprof-name">{profile.name}</h2>
              <p className="vetprof-clinic">{profile.clinicName}</p>
              <p className="vetprof-spec">{profile.specialization}</p>

              {/* Stats Section */}
              <div className="vetprof-stats">
                <div className="vetprof-stat-item">
                  <div className="vetprof-stat-value">5+</div>
                  <div className="vetprof-stat-label">Years Experience</div>
                </div>
                <div className="vetprof-stat-divider"></div>
                <div className="vetprof-stat-item">
                  <div className="vetprof-stat-value">500+</div>
                  <div className="vetprof-stat-label">Patients Treated</div>
                </div>
                <div className="vetprof-stat-divider"></div>
                <div className="vetprof-stat-item">
                  <div className="vetprof-stat-value">4.9</div>
                  <div className="vetprof-stat-label">Rating</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="vetprof-info-grid">
                <div className="vetprof-info-item">
                  <div className="vetprof-info-icon">
                    <Phone size={18} />
                  </div>
                  <div className="vetprof-info-content">
                    <div className="vetprof-info-label">Phone</div>
                    <div className="vetprof-info-value">{profile.phone}</div>
                  </div>
                </div>

                <div className="vetprof-info-item">
                  <div className="vetprof-info-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="vetprof-info-content">
                    <div className="vetprof-info-label">Address</div>
                    <div className="vetprof-info-value">{profile.clinicAddress}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="vetprof-edit-btn" onClick={() => setEdit(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="vetprof-edit-content">
              <h3 className="vetprof-edit-title">Edit Profile</h3>

              <div className="vetprof-form-group">
                <label className="vetprof-form-label">
                  <Building2 size={16} />
                  Full Name
                </label>
                <input
                  className="vetprof-form-input"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="vetprof-form-group">
                <label className="vetprof-form-label">
                  <Building2 size={16} />
                  Clinic Name
                </label>
                <input
                  className="vetprof-form-input"
                  value={form.clinicName || ""}
                  onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                  placeholder="Enter clinic name"
                />
              </div>

              <div className="vetprof-form-group">
                <label className="vetprof-form-label">
                  <Award size={16} />
                  Specialization
                </label>
                <input
                  className="vetprof-form-input"
                  value={form.specialization || ""}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="Enter your specialization"
                />
              </div>

              <div className="vetprof-form-group">
                <label className="vetprof-form-label">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  className="vetprof-form-input"
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="vetprof-form-group">
                <label className="vetprof-form-label">
                  <MapPin size={16} />
                  Clinic Address
                </label>
                <textarea
                  className="vetprof-form-textarea"
                  value={form.clinicAddress || ""}
                  onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })}
                  placeholder="Enter clinic address"
                  rows={3}
                />
              </div>

              <div className="vetprof-form-actions">
                <button className="vetprof-save-btn" onClick={saveProfile}>
                  Save Changes
                </button>
                <button className="vetprof-cancel-btn" onClick={() => setEdit(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Section */}
        <div className="vetprof-cert-section">
          <div className="vetprof-cert-header">
            <Award size={20} />
            <h3>Professional Certificate</h3>
          </div>
          
          {profile.certificatePath ? (
            <div className="vetprof-cert-content">
              <div className="vetprof-cert-info">
                <div className="vetprof-cert-icon">📄</div>
                <div>
                  <div className="vetprof-cert-title">Certificate Uploaded</div>
                  <div className="vetprof-cert-subtitle">Your certificate is verified</div>
                </div>
              </div>
              <div className="vetprof-cert-actions">
                <a
                  href={getImageUrl(profile.certificatePath)}
                  target="_blank"
                  rel="noreferrer"
                  className="vetprof-cert-view"
                >
                  View Certificate
                </a>
                <label className="vetprof-cert-update">
                  Update
                  <input
                    type="file"
                    className="vetprof-hidden-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCertificate(f);
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="vetprof-cert-upload">
              <div className="vetprof-cert-empty-icon">📋</div>
              <div className="vetprof-cert-empty-text">No certificate uploaded</div>
              <label className="vetprof-cert-upload-btn">
                Upload Certificate
                <input
                  type="file"
                  className="vetprof-hidden-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCertificate(f);
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}