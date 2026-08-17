import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import OwnerProfileDropdown from "../Owner_user/OwnerProfileDropdown";
import "../../styles/OwnerHeader.css";

/**
 * API base URL
 * Used to correctly load profile images from backend
 */
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export default function OwnerHeader() {
  const navigate = useNavigate();

  // Controls dropdown open/close state
  const [open, setOpen] = useState(false);

  // Reference to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Owner data used by header dropdown
   * This MUST come from sessionStorage
   */
  const [owner, setOwner] = useState<{
    name: string;
    email?: string;
    photoPath?: string;
  } | null>(null);

  /**
   * Load owner info from sessionStorage on mount
   * This data is synced after:
   * - Login
   * - View Profile
   * - Edit Profile
   */
  useEffect(() => {
    const storedOwner = sessionStorage.getItem("owner");
    if (storedOwner) {
      setOwner(JSON.parse(storedOwner));
    }
  }, []);

  /**
   * Logout handler
   * Clears all auth-related session data
   */
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("owner");
    navigate("/login");
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  /**
   * 🔥 FIXED PROFILE IMAGE URL
   * photoPath is NOT a full URL → must be prefixed with backend base
   */
  const profileImage = owner?.photoPath
    ? `${API_BASE}${
        owner.photoPath.startsWith("/uploads")
          ? owner.photoPath
          : `/uploads/${owner.photoPath}`
      }`
    : null;

  return (
    <header className="owner-header">
      <div className="header-container">
        {/* ================= LOGO ================= */}
        <Link to="/owner/home" className="header-logo-link">
          <div className="header-logo">
            <i className="fa-solid fa-paw logo-icon"></i>
            <h2 className="logo-text">PetCare</h2>
          </div>
        </Link>

        {/* ================= NAVIGATION ================= */}
        <nav className="header-nav">
          <Link to="/owner/home" className="nav-link">
            <i className="fa-solid fa-house nav-icon"></i>
            <span>Home</span>
          </Link>

          <Link to="/owner/mypets" className="nav-link">
            <i className="fa-solid fa-cat nav-icon"></i>
            <span>My Pets</span>
          </Link>

          <Link to="/owner/vets" className="nav-link">
            <i className="fa-solid fa-user-doctor nav-icon"></i>
            <span>Available Vets</span>
          </Link>
          <Link to="/owner/store" className="nav-link">
            <i className="fa-solid fa-cart-shopping"></i> Store
          </Link>

          {/* ================= PROFILE DROPDOWN ================= */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className={`profile-btn ${open ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation(); // prevent document click
                setOpen((prev) => !prev);
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-avatar-img"
                />
              ) : (
                <div className="default-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </button>

            {/* Render dropdown ONLY when open and owner exists */}
            {open && owner && (
              <OwnerProfileDropdown
                onClose={() => setOpen(false)}
                onLogout={logout}
                name={owner.name}
                email={owner.email}
                photoPath={owner.photoPath}
              />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
