import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import {
  apiFetchPets,
  apiListVaccinations,
  apiGetOwnerProfile,
  type Pet,
  type OwnerProfile,
} from "../../api";
import client from "../../api";
import "../../styles/ownerHome.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

interface Appointment {
  id: number;
  petId: number;
  vetId: number;
  appointmentDate: string;
  slot: string;
  status: string;
  petName?: string;
  vetName?: string;
}

interface Vaccination {
  id: number;
  vaccineName: string;
  dateGiven: string;
  nextDueDate: string;
}

export default function OwnerHome() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageVersion, setImageVersion] = useState(Date.now());


  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Load owner profile
      const ownerData = await apiGetOwnerProfile();
      setOwner(ownerData);

      // Load pets
      const petsList = await apiFetchPets();
      setPets(petsList);
      setImageVersion(Date.now()); 


      // Load appointments for all pets
      const allAppointments: Appointment[] = [];
      for (const pet of petsList) {
        try {
          const response = await client.get(`/api/pets/${pet.id}/appointments`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
          const petAppts = response.data.map((appt: any) => ({
            ...appt,
            petName: pet.name,
          }));
          allAppointments.push(...petAppts);
        } catch (err) {
          console.error(`Failed to load appointments for pet ${pet.id}`, err);
        }
      }

      // Filter upcoming appointments
      const today = new Date();
      const upcomingAppts = allAppointments
  .filter((a) => {
    const apptDate = new Date(a.appointmentDate);

    // ✅ FIX: allow the FULL day instead of midnight cutoff
    apptDate.setHours(23, 59, 59, 999);

    const status = a.status?.toUpperCase();

    return (
      apptDate >= today &&
      (status === "APPROVED" || status === "PENDING")
    );
  })
  .sort(
    (a, b) =>
      new Date(a.appointmentDate).getTime() -
      new Date(b.appointmentDate).getTime()
  )
  .slice(0, 3);


      setAppointments(upcomingAppts);

      // Load vaccinations for all pets
      const allVaccinations: Vaccination[] = [];
      for (const pet of petsList) {
        try {
          const petVaccines = await apiListVaccinations(String(pet.id));
          allVaccinations.push(...petVaccines);
        } catch (err) {
          console.error(`Failed to load vaccinations for pet ${pet.id}`, err);
        }
      }

      // Filter vaccines due soon (within 30 days)
      const vaccinesDueSoon = allVaccinations.filter((v) => {
        if (!v.nextDueDate) return false;
        const dueDate = new Date(v.nextDueDate);
        const diffDays =
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 0 && diffDays <= 30;
      });

      setVaccinations(vaccinesDueSoon);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (slot: string) => {
    const timeMap: { [key: string]: string } = {
      MORNING: "9:00 AM",
      AFTERNOON: "2:00 PM",
      EVENING: "6:00 PM",
    };
    return timeMap[slot] || slot;
  };

  const currentYear = new Date().getFullYear();
  const vetVisitsThisYear = appointments.filter((a) =>
    a.appointmentDate.startsWith(currentYear.toString())
  ).length;

  if (loading) {
    return (
      <div className="owner-home-page">
        <OwnerHeader />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-home-page">
      <OwnerHeader />

      <div className="home-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome Back, {owner?.name?.split(" ")[0] || "Pet Owner"}!
          </h1>
          <p className="welcome-subtitle">
            Here's what's happening with your pets today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card orange">
            <div className="stat-icon">
              <i className="fa-solid fa-paw"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{pets.length}</div>
              <div className="stat-label">Total Pets</div>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{appointments.length}</div>
              <div className="stat-label">Upcoming Appointments</div>
            </div>
          </div>

          <div className="stat-card pink">
            <div className="stat-icon">
              <i className="fa-solid fa-syringe"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{vaccinations.length}</div>
              <div className="stat-label">Vaccines Due</div>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <i className="fa-solid fa-hospital"></i>
            </div>
            <div className="stat-info">
              <div className="stat-number">{vetVisitsThisYear}</div>
              <div className="stat-label">Vet Visits This Year</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* My Pets Section */}
          <div className="dashboard-card pets-card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fa-solid fa-paw"></i>
                My Pets
              </h2>
              <Link to="/owner/mypets" className="btn-add">
                + Add Pet
              </Link>
            </div>

            <div className="pets-list">
              {pets.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-paw"></i>
                  <p>No pets added yet</p>
                  <Link to="/owner/mypets" className="btn-empty">
                    Add Your First Pet
                  </Link>
                </div>
              ) : (
                pets.slice(0, 3).map((pet) => (
                  <div
                    key={pet.id}
                    className="pet-item1"
                    onClick={() => navigate(`/pets/${pet.id}`)}
                  >
                    <div className="pet-avatar-wrapper">
                      <img
                       src={
  pet.photoPath
    ? `${API_BASE}/uploads/${pet.photoPath}?v=${imageVersion}`
    : ""
}

                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                          const initialsDiv = e.currentTarget
                            .nextElementSibling as HTMLDivElement;
                          if (initialsDiv) initialsDiv.style.display = "flex";
                        }}
                        className="pet-avatar-img"
                        alt={pet.name}
                      />
                      <div
                        className="pet-avatar-initials"
                        style={{ display: "none" }}
                      >
                        {getInitials(pet.name)}
                      </div>
                    </div>
                    <div className="pet-info">
                      <div className="pet-name">{pet.name}</div>
                      <div className="pet-breed">
                        {pet.species}
                        {pet.breed && ` • ${pet.breed}`}
                      </div>
                      <div className="pet-age">
                        {pet.dob
                          ? `${
                              new Date().getFullYear() -
                              new Date(pet.dob).getFullYear()
                            } years`
                          : "Age unknown"}
                      </div>
                    </div>
                    <div className="pet-status">
                      <span className="status-badge healthy">Healthy</span>
                    </div>
                    <button className="btn-view">View Profile</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="dashboard-card appointments-card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fa-solid fa-calendar-days"></i>
                Upcoming Appointments
              </h2>
              <button
  className="link-view-all"
  onClick={() =>
    navigate("/owner/mypets", {
      state: { filter: "appointments" }
    })
  }
>
  View All
</button>


            </div>

            <div className="appointments-list">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-calendar-xmark"></i>
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                appointments.map((appt) => {
                  const pet = pets.find((p) => p.id === appt.petId);
                  return (
                    <div key={appt.id} className="appointment-item">
                      <div className="appointment-icon">
                        <i className="fa-solid fa-calendar-check"></i>
                      </div>
                      <div className="appointment-info">
                        <div className="appointment-title">
                          {appt.petName || pet?.name || "Pet"} - {appt.status}
                        </div>
                        <div className="appointment-date">
                          {formatDate(appt.appointmentDate)} at{" "}
                          {formatTime(appt.slot)}
                        </div>
                        <div className="appointment-vet">
                          <i className="fa-solid fa-user-doctor"></i>
                          {appt.vetName || "Veterinarian"}
                        </div>
                      </div>
                      <button
  className="btn-details"
  onClick={() =>
    navigate("/owner/mypets", {
      state: { filter: "appointments" }
    })
  }
>
  Details
</button>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h2 className="card-title">
            <i className="fa-solid fa-bolt"></i>
            Quick Actions
          </h2>

          <div className="actions-grid">
            <button
              className="action-btn"
              onClick={() => navigate("/owner/vets")}
            >
              <div className="action-icon blue">
                <i className="fa-solid fa-calendar-plus"></i>
              </div>
              <span className="action-label">Book Appointment</span>
            </button>

            <button
              className="action-btn"
              onClick={() => {
                if (pets.length > 0 && pets[0]) {
                  navigate(`/pets/${pets[0].id}`);
                } else {
                  navigate("/owner/mypets");
                }
              }}
            >
              <div className="action-icon purple">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <span className="action-label">View Health Records</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/owner/mypets")}
            >
              <div className="action-icon orange">
                <i className="fa-solid fa-plus"></i>
              </div>
              <span className="action-label">Add New Pet</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/owner/profile/edit")}
            >
              <div className="action-icon teal">
                <i className="fa-solid fa-user-pen"></i>
              </div>
              <span className="action-label">Update Profile</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/owner/vets")}
            >
              <div className="action-icon pink">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <span className="action-label">Find a Vet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

