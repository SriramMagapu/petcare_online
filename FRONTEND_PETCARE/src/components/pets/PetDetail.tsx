// src/components/pets/PetDetail.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGetPet, type Pet } from "../../api";
import "../../styles/PetDetail.css";

import PetOverview from "./PetOverview";
import PetMedicalHistory from "./PetMedicalHistory";
import PetVaccinations from "./PetVaccination";
import PetHealth from "./health/PetHealth";
import PetReminder from "./PetReminder";
import { getImageUrl } from "../../utils/imageUrl";

type TabType = "overview" | "medical" | "vaccinations" | "health" | "reminders";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petId = id!;
  const [pet, setPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [imageVersion, setImageVersion] = useState(Date.now());

  useEffect(() => {
    apiGetPet(petId).then((p) => {
      setPet(p);
      setImageVersion(Date.now());
    });
  }, [petId]);

  if (!pet) {
    return (
      <div className="pet-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pet details...</p>
        </div>
      </div>
    );
  }

  const IMAGE_URL = getImageUrl(pet.photoPath, "https://ui-avatars.com/api/?name=Pet&size=256&background=e0e7ff&color=6366f1");

  return (
    <div className="pet-detail-page">
      {/* Background Bubbles */}
      <div className="page-bg-animation">
        <div className="bubble b1"></div>
        <div className="bubble b2"></div>
      </div>

      {/* --- WHITE HEADER BAR (Left Aligned) --- */}
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="page-title">Pet Profile</h1>
      </div>

      <div className="detail-container">
        {/* Main Card */}
        <div className="pet-detail-card">
          {/* Profile Summary */}
          <div className="profile-summary">
            <div className="profile-avatar">
              <img
                src={IMAGE_URL}
                alt={pet.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://ui-avatars.com/api/?name=Pet&size=256&background=e0e7ff&color=6366f1";
                }}
              />
            </div>

            <div className="profile-info">
              <h2 className="profile-name">{pet.name}</h2>
              <p className="profile-meta">
                {pet.species} • {pet.breed || "—"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs-wrapper">
              <button
                className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <i className="fa-solid fa-file-lines"></i>
                Overview
              </button>

              <button
                className={`tab-button ${activeTab === "medical" ? "active" : ""}`}
                onClick={() => setActiveTab("medical")}
              >
                <i className="fa-solid fa-notes-medical"></i>
                Appointments
              </button>

              <button
                className={`tab-button ${activeTab === "vaccinations" ? "active" : ""}`}
                onClick={() => setActiveTab("vaccinations")}
              >
                <i className="fa-solid fa-syringe"></i>
                Vaccinations
              </button>

              <button
                className={`tab-button ${activeTab === "health" ? "active" : ""}`}
                onClick={() => setActiveTab("health")}
              >
                <i className="fa-solid fa-chart-column"></i>
                Health & Vitals
              </button>

              <button
                className={`tab-button ${activeTab === "reminders" ? "active" : ""}`}
                onClick={() => setActiveTab("reminders")}
              >
                <i className="fa-solid fa-bell"></i>
                Reminders
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <PetOverview
                petId={petId}
                onUpdated={(p) => {
                  setPet(p);
                  setImageVersion(Date.now());
                }}
              />
            )}

            {activeTab === "medical" && <PetMedicalHistory petId={petId} />}
            {activeTab === "vaccinations" && <PetVaccinations petId={petId} />}
            {activeTab === "health" && <PetHealth petId={petId} />}

            {activeTab === "reminders" && (
  <PetReminder petId={petId} />
)}

          </div>
        </div>
      </div>
    </div>
  );
}