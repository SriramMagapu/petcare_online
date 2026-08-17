import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN */}
      <div className="admin-main">
        <AdminHeader />

        <div className="admin-content-wrapper">
          <div className="admin-content">
            {/* 🔑 ROUTER WILL RENDER PAGES HERE */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
