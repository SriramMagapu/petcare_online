import React from "react";
import "./AdminHeader.css";

export default function AdminHeader() {
  const handleLogout = () => {
    console.log("Logged out");
    window.location.href = "/login";
  };

  return (
    <header className="admin-header">
      {/* Left section is now empty as search is removed */}
      <div className="header-left"></div>

      <div className="header-right">
        {/* User Profile - Dropdown logic and arrow removed */}
        <div className="user-section-static">
          <div className="user-details">
            <p className="u-name">System Administrator</p>
            <p className="u-role">Admin</p>
          </div>
          <div className="avatar">
            <i className="fa-solid fa-user-shield"></i>
          </div>
        </div>

        {/* Logout Button */}
        <button className="btn-logout" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </header>
  );
}