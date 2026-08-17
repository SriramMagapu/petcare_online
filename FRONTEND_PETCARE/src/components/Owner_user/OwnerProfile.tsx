import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import { apiGetOwnerProfile, type OwnerProfile } from "../../api";
import "../../styles/ownerProfile.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Pet+Owner&size=256&background=0D8ABC&color=fff";

export default function OwnerProfile() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect(() => {
  //   apiGetOwnerProfile()
  //     .then(setProfile)
  //     .finally(() => setLoading(false));
  // }, []);

  useEffect(() => {
  apiGetOwnerProfile()
    .then((data) => {
      setProfile(data);

      // 🔥 SYNC DATA FOR HEADER DROPDOWN
      sessionStorage.setItem(
        "owner",
        JSON.stringify({
          name: data.name,
          email: data.email,
          photoPath: data.photoPath,
        })
      );
    })
    .finally(() => setLoading(false));
}, []);

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return "PO";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="owner-profile-page">
        <OwnerHeader />
        <div className="profile-page-container">
          <div className="profile-loading">
            <div className="loading-spinner" />
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="owner-profile-page">
        <OwnerHeader />
        <div className="profile-page-container">
          <div className="profile-error">
            <i className="fa-solid fa-circle-exclamation" />
            <p>Unable to load profile data</p>
            <button
              className="btn-retry"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile image URL
const profileImage = profile.photoPath
  ? `${API_BASE}${profile.photoPath.startsWith("/uploads")
      ? profile.photoPath
      : `/uploads/${profile.photoPath}`}`
  : DEFAULT_AVATAR;
  return (
    <div className="owner-profile-page">
      <OwnerHeader />

      <div className="profile-page-container">
        <div className="profile-card">
          {/* Header */}
          <div className="profile-card-header">
            <div>
              <h1 className="profile-page-title">My Profile</h1>
              <p className="profile-page-subtitle">
                View and manage your personal information
              </p>
            </div>

            <button
              className="btn-edit-profile"
              onClick={() => navigate("/owner/profile/edit")}
            >
              <i className="fa-solid fa-pen" />
              Edit Profile
            </button>
          </div>

          {/* Main Content */}
          <div className="profile-content-grid">
            {/* LEFT: Profile Details */}
            <div className="profile-details-section">
              <div className="profile-field">
                <div className="field-icon">
                  <i className="fa-solid fa-user" />
                </div>
                <div className="field-content">
                  <label className="field-label">Full Name</label>
                  <p className="field-value">
                    {profile.name || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <i className="fa-solid fa-envelope" />
                </div>
                <div className="field-content">
                  <label className="field-label">Email Address</label>
                  <p className="field-value">{profile.email}</p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <i className="fa-solid fa-phone" />
                </div>
                <div className="field-content">
                  <label className="field-label">Phone Number</label>
                  <p className="field-value">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div className="field-content">
                  <label className="field-label">Address</label>
                  <p className="field-value">
                    {profile.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Profile Photo (fills entire right section) */}
            <div className="profile-photo-section">
              <img
                src={profileImage}
                alt="Profile"
                className="profile-avatar-img"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";

                  const fallback =
                    img.parentElement?.querySelector(
                      ".profile-avatar-initials"
                    ) as HTMLDivElement;

                  if (fallback) fallback.style.display = "flex";
                }}
              />

              <div className="profile-avatar-initials" style={{ display: "none" }}>
                {getInitials(profile.name)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}