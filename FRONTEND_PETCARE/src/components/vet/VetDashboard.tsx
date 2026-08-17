// src/pages/vet/VetDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardHome from "./components/DashboardHome";
import AppointmentsSection from "./components/AppointmentsSection";
import ProfileSection from "./components/ProfileSection";
import type { VetAppointment, VetProfileData, DashboardStats } from "../../api";
import "../../styles/VetDashboard.css";

export default function VetDashboard() {
  const navigate = useNavigate();
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [activeSection, setActiveSection] =
    useState<"home" | "appointments" | "profile">("home");

  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [profile, setProfile] = useState<VetProfileData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVetProfile();
    fetchAllAppointments();
  }, []);

  const fetchVetProfile = async () => {
    try {
      const res = await client.get("/api/vet/profile");
      setProfile(res.data);

      // ✅ sync for Header
      sessionStorage.setItem(
        "vet",
        JSON.stringify({
          name: res.data.name,
          id: res.data.id
        })
      );
    } catch (err) {
      console.error("Failed to load vet profile", err);
    }
  };

  const fetchAllAppointments = async () => {

    
    try {
      const [req, app, comp , rej] = await Promise.all([
        client.get("/api/vet/appointments?status=REQUESTED"),
        client.get("/api/vet/appointments?status=APPROVED"),
        client.get("/api/vet/appointments?status=COMPLETED"),
        client.get("/api/vet/appointments?status=REJECTED")
      ]);

      console.log(req.data, "REQUESTED");
console.log(app.data, "APPROVED");
console.log(comp.data, "COMPLETED");
console.log(rej.data, "REJECTED");


      const all = [...req.data, ...app.data, ...comp.data, ...rej.data]
  .filter(a => a.petId !== null)
  .map((a: any) => ({
  id: a.id,
  petId: a.petId,
  appointmentDate: a.appointmentDate,
  slot: a.slot,
  status: a.status,
  petName: a.petName || `Pet #${a.petId}`,
  petSpecies: a.petSpecies || "Pet",
  petHealthStatus: a.petHealthStatus,
  ownerName: a.ownerName || `Owner #${a.ownerId}`,
  notes: a.vetNotes
}))


  // sort newest first (fix rejected visibility)
all.sort((a, b) =>
  new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
);


      setAppointments(all);
      setStats({
        total: all.length,
        pending: all.filter(a => a.status === "REQUESTED").length,
        accepted: all.filter(a => a.status === "APPROVED").length,
        completed: all.filter(a => a.status === "COMPLETED").length,
        rejected: all.filter(a => a.status === "REJECTED").length
      });
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  };

  const handleApprove = async (id: number) => {
    await client.put(`/api/appointments/${id}/approve`);
    fetchAllAppointments();
  };

  const handleReject = async (id: number) => {
    await client.put(`/api/appointments/${id}/reject`);
    fetchAllAppointments();
  };

  const handleComplete = async (id: number) => {
    await client.put(`/api/appointments/${id}/notes`, "Consultation completed", {
      headers: { "Content-Type": "text/plain" }
    });
    fetchAllAppointments();
  };

  // ✅ FIXED
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const filteredAppointments = appointments.filter(a =>
    a.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  return (
    <div className="vet-dashboard">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="vet-main-content">
        <Header
          profile={profile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleLogout={handleLogout}
        />

        <div className="vet-content-area">
          {activeSection === "home" && (
            <DashboardHome
              profile={profile}
              stats={stats}
              appointments={appointments}
            />
          )}

          {activeSection === "appointments" && (
            <AppointmentsSection
              filteredAppointments={filteredAppointments}
              openActionId={openActionId}
              setOpenActionId={setOpenActionId}
              handleApprove={handleApprove}
              handleReject={handleReject}
              handleComplete={handleComplete}
              navigate={navigate}
            />
          )}

          {activeSection === "profile" && profile && (
            <ProfileSection
            />
          )}
        </div>
      </div>
    </div>
  );
}
