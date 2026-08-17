// src/components/pets/PetList.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  apiFetchPets,
  apiCreatePet,
  apiUploadPetPhoto,
  apiFetchAppointmentsByPet,
  apiListVaccinations,
  type Pet,
} from "../../api";
import "../../styles/PetList.css";
import { getImageUrl } from "../../utils/imageUrl";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export default function PetList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const location = useLocation();
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");

  const initialFilter = (location.state as any)?.filter || "all";
  const [activeFilter, setActiveFilter] = useState<
    "all" | "appointments" | "vaccinated"
  >(initialFilter);

  const [petsWithAppointments, setPetsWithAppointments] = useState<Set<number>>(
    new Set()
  );
  const [petsWithDueVaccines, setPetsWithDueVaccines] = useState<Set<number>>(
    new Set()
  );

  const [form, setForm] = useState<Partial<Pet>>({
    name: "",
    species: "",
    breed: "",
    gender: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (location.state?.filter) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  async function loadPets() {
    try {
      setLoading(true);
      const list = await apiFetchPets();
      setPets(list);

      const apptSet = new Set<number>();
      const vaccineSet = new Set<number>();
      const today = new Date();

      await Promise.all(
        list.map(async (p) => {
          const appts = await apiFetchAppointmentsByPet(p.id);
          if (appts.some((a: any) => a.status === "APPROVED")) {
            apptSet.add(p.id);
          }

          const vaccines = await apiListVaccinations(String(p.id));
          const hasDueSoon = vaccines.some((v: any) => {
            if (!v.nextDueDate) return false;
            const due = new Date(v.nextDueDate);
            const diffDays =
              (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays > 0 && diffDays <= 30;
          });

          if (hasDueSoon) {
            vaccineSet.add(p.id);
          }
        })
      );

      setPetsWithAppointments(apptSet);
      setPetsWithDueVaccines(vaccineSet);
    } catch {
      setApiError("Failed to load pets");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name?.trim()) {
      setFormError("Pet name is required");
      return;
    }
    if (!form.species) {
      setFormError("Please enter species");
      return;
    }
    if (!form.gender) {
      setFormError("Please select gender");
      return;
    }

    try {
      const created = await apiCreatePet(form as Pet);
      if (photo) {
        await apiUploadPetPhoto(String(created.id), photo);
      }
      await loadPets();
      setShowAdd(false);
      setForm({ name: "", species: "", breed: "", gender: "" });
      setPhoto(null);
    } catch {
      setFormError("Failed to create pet");
    }
  }

  const filteredPets = pets.filter((p) => {
    let matchesSidebar = true;
    if (activeFilter === "appointments") {
      matchesSidebar = petsWithAppointments.has(p.id);
    } else if (activeFilter === "vaccinated") {
      matchesSidebar = petsWithDueVaccines.has(p.id);
    }
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSidebar && matchesSearch;
  });

  return (
    <div className="pet-list-page">
      {/* --- BACKGROUND ANIMATION --- */}
      <div className="page-bg-animation">
        <div className="bubble b1"></div>
        <div className="bubble b2"></div>
        <div className="bubble b3"></div>
        <div className="bubble b4"></div>
      </div>

      <aside className="pet-sidebar">
        <div className="sidebar-header">
          <h3> </h3> 
        </div>

        <div className="sidebar-menu">
          <div className="menu-title">Overview</div>
          <ul className="menu-list">
            <li
              className={activeFilter === "all" ? "active" : ""}
              onClick={() => setActiveFilter("all")}
            >
              All Pets
              <span className="menu-badge">{pets.length}</span>
            </li>

            <li
              className={
                petsWithAppointments.size === 0
                  ? "disabled"
                  : activeFilter === "appointments"
                  ? "active"
                  : ""
              }
              onClick={() => {
                if (petsWithAppointments.size === 0) {
                  alert("No approved appointments yet");
                  return;
                }
                setActiveFilter("appointments");
              }}
            >
              Appointments
              {petsWithAppointments.size > 0 && (
                <span className="menu-badge">{petsWithAppointments.size}</span>
              )}
            </li>

            <li
              className={
                petsWithDueVaccines.size === 0
                  ? "disabled"
                  : activeFilter === "vaccinated"
                  ? "active"
                  : ""
              }
              onClick={() => {
                if (petsWithDueVaccines.size === 0) {
                  alert("No vaccinations due soon");
                  return;
                }
                setActiveFilter("vaccinated");
              }}
            >
              Vaccinations Due
              {petsWithDueVaccines.size > 0 && (
                <span className="menu-badge">{petsWithDueVaccines.size}</span>
              )}
            </li>
          </ul>
        </div>
      </aside>

      <main className="pet-content">
        <div className="content-header">
          <div>
            <h1 className="p-title">My Pets</h1>
            <p className="p-subtitle">Welcome back to PetCare</p>
          </div>
        </div>

        <div className="action-bar">
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search pets..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="btn-add-pet-main"
            onClick={() => setShowAdd(true)}
          >
            <i className="fa-solid fa-plus"></i> Add Pet
          </button>
        </div>

        <div className="pets-container">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading pets...</p>
            </div>
          )}

          {!loading && filteredPets.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No pets found</h3>
              <p>Try adjusting your search or add a new pet.</p>
            </div>
          )}

          {!loading && filteredPets.length > 0 && (
            <div className="pets-grid">
              {filteredPets.map((p) => (
                <Link key={p.id} to={`/pets/${p.id}`} className="pet-card">
                  <div className="pet-image-wrapper">
                    <img
                      src={getImageUrl(p.photoPath)}
                      alt={p.name}
                      className="pet-image"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://ui-avatars.com/api/?name=Pet&size=512&background=60a5fa&color=fff";
                      }}
                    />
                  </div>
                  <h3 className="pet-name">{p.name}</h3>
                  <p className="pet-breed">{p.breed || p.species || "Pet"}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- ADD PET MODAL --- */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Pet</h3>
              <button
                className="modal-close"
                onClick={() => setShowAdd(false)}
              >
                ×
              </button>
            </div>

            <form className="pet-form" onSubmit={onCreate} noValidate>
              <div className="form-group">
                <label>Pet Name</label>
                <input
                  className="form-input"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter pet name"
                />
              </div>

              {/* --- CHANGED: Species is now an Input with Placeholder --- */}
              <div className="form-group">
                <label>Species</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.species || ""}
                  onChange={(e) =>
                    setForm({ ...form, species: e.target.value })
                  }
                  placeholder="e.g. Dog, Cat, Bird"
                />
              </div>

              {/* --- Breed Input with Placeholder --- */}
              <div className="form-group">
                <label>Breed</label>
                <input
                  className="form-input"
                  value={form.breed || ""}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="e.g. Golden Retriever, Persian"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  className="form-select"
                  value={form.gender || ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="photo-upload">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload pet photo</span>
                  <small><br/>PNG or JPG</small>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {formError && <div className="form-error">{formError}</div>}

              <div className="form-actions">
                <button className="btn-submit" type="submit">
                  Save Pet
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAdd(false);
                    setFormError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}