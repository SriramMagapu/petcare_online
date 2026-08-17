// src/pages/vet/components/Header.tsx
import React from "react";
import { LogOut } from "lucide-react";
import type { VetProfileData } from "../../../api";
import "./Header.css";
import { getImageUrl } from "../../../utils/imageUrl";

interface HeaderProps {
  profile: VetProfileData | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleLogout: () => void;
}

export default function Header({
  profile,
  searchTerm,
  setSearchTerm,
  handleLogout,
}: HeaderProps) {
  const initial = profile?.name?.charAt(0)?.toUpperCase() || "V";

  return (
    <div className="vethd-header">
      {/* Empty left space for balance */}
      <div className="vethd-header-left"></div>

      {/* RIGHT: User Info + Logout */}
      <div className="vethd-header-right">
        {/* USER INFO */}
        <div className="vethd-user-info">
          <div className="vethd-user-details">
            <div className="vethd-user-name">
              {profile?.name || "Veterinarian"}
            </div>
            <div className="vethd-user-role">Veterinarian</div>
          </div>

          {/* AVATAR */}
          <div className="vethd-user-avatar">
            {profile?.photoPath ? (
              <img
                src={getImageUrl(profile.photoPath)}
                alt="Vet"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="vethd-logout-btn">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}