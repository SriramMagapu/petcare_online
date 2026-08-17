import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "fa-solid fa-chart-line" },
    { path: "/admin/users", label: "User Management", icon: "fa-solid fa-users" },
    { path: "/admin/vets", label: "Vet Approvals", icon: "fa-solid fa-user-doctor" },
    { path: "/admin/store", label: "Store Management", icon: "fa-solid fa-store" },
    { path: "/admin/orders", label: "Orders", icon: "fa-solid fa-box" },
    { path: "/admin/reports", label: "Reports", icon: "fa-solid fa-chart-pie" },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <i className="fa-solid fa-paw"></i>
          </div>
          <div className="logo-text">
            <div className="logo-title">PETCARE</div>
            <div className="logo-subtitle">Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <div className="sidebar-item-content">
              <i className={`${item.icon} sidebar-icon`}></i>
              <span>{item.label}</span>
            </div>
            {/* Active Indicator */}
            <div className="active-indicator"></div>
          </NavLink>
        ))}
      </nav>

      {/* Footer Decoration */}
      <div className="sidebar-footer">
        <div className="footer-decoration">
          <i className="fa-solid fa-paw"></i>
        </div>
      </div>
    </aside>
  );
}