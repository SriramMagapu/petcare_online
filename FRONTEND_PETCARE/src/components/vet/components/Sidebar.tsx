// src/pages/vet/components/Sidebar.tsx
import React from "react";
import { Home, Calendar, User } from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  activeSection: "home" | "appointments" | "profile";
  setActiveSection: (section: "home" | "appointments" | "profile") => void;
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <div className="vetsd-sidebar">
      <div className="vetsd-sidebar-header">
        <div className="vetsd-logo-container">
          <div className="vetsd-logo-icon">
            <i className="fa-solid fa-paw"></i>
          </div>
          <div className="vetsd-logo-text">PetCare</div>
        </div>
      </div>

      <div className="vetsd-sidebar-menu">
        <SidebarItem
          icon={<Home size={20} />}
          label="Dashboard"
          active={activeSection === "home"}
          onClick={() => setActiveSection("home")}
        />
        <SidebarItem
          icon={<Calendar size={20} />}
          label="My Appointments"
          active={activeSection === "appointments"}
          onClick={() => setActiveSection("appointments")}
        />
        <SidebarItem
          icon={<User size={20} />}
          label="My Profile"
          active={activeSection === "profile"}
          onClick={() => setActiveSection("profile")}
        />
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={`vetsd-sidebar-item ${active ? "vetsd-active" : ""}`}
    >
      <span className="vetsd-item-icon">{icon}</span>
      <span className="vetsd-item-label">{label}</span>
    </div>
  );
}