import { useEffect, useState } from "react";
import client, { apiListVaccinations } from "../../api";
import "../../styles/petVaccinations.css";

type Vaccination = {
  id: number;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
};

export default function PetVaccinations({ petId }: { petId: string }) {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vaccineName: "",
    dateGiven: "",
    nextDueDate: "",
  });

  /* ================= LOAD VACCINATIONS ================= */
  useEffect(() => {
    loadVaccinations();
  }, [petId]);

  async function loadVaccinations() {
    try {
      setLoading(true);
      const data = await apiListVaccinations(petId);
      setVaccinations(data);
    } catch (err) {
      console.error("Failed to load vaccinations", err);
      setVaccinations([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= SUBMIT ================= */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await client.post(`/api/pets/${petId}/vaccinations`, form);

      setForm({ vaccineName: "", dateGiven: "", nextDueDate: "" });
      setShowForm(false);
      loadVaccinations();
    } catch (err) {
      console.error("Failed to add vaccination", err);
    }
  }

  /* ================= HELPERS ================= */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isUpcoming = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffDays =
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <section className="pet-vaccinations">
      {/* HEADER */}
      <div className="vaccinations-header">
        <div>
          <h3 className="vaccinations-title">💉 Vaccinations</h3>
          <p className="vaccinations-subtitle">
            Track and manage your pet’s vaccination history
          </p>
        </div>

        <button
          className="add-vaccination-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Vaccination
        </button>
      </div>

      {/* LOADING / EMPTY / LIST */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading vaccinations...</p>
        </div>
      ) : vaccinations.length === 0 ? (
        <div className="vaccination-empty">
          <div className="vaccination-empty-icon">💉</div>
          <h4>No Vaccinations Recorded</h4>
          <p>Start tracking your pet’s vaccination history</p>

          <button
            className="empty-add-btn"
            onClick={() => setShowForm(true)}
          >
            + Add First Vaccination
          </button>
        </div>
      ) : (
        <div className="vaccinations-list">
          {vaccinations.map((v) => (
            <div key={v.id} className="vaccination-card">
              <div className="vaccination-card-title">
                {v.vaccineName}
              </div>

              <div className="vaccination-dates">
                <span>Given: {formatDate(v.dateGiven)}</span>

                {v.nextDueDate && (
                  <span
                    className={
                      isUpcoming(v.nextDueDate) ? "upcoming" : ""
                    }
                  >
                    Next Due: {formatDate(v.nextDueDate)}
                    {isUpcoming(v.nextDueDate) && (
                      <span className="due-badge">Due Soon</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4 className="modal-title">Add Vaccination</h4>

            <form onSubmit={submit} className="modal-form">
              <label>Vaccine Name *</label>
              <input
                type="text"
                value={form.vaccineName}
                onChange={(e) =>
                  setForm({ ...form, vaccineName: e.target.value })
                }
                required
              />

              <label>Date Given *</label>
              <input
                type="date"
                value={form.dateGiven}
                onChange={(e) =>
                  setForm({ ...form, dateGiven: e.target.value })
                }
                required
              />

              <label>Next Due Date</label>
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) =>
                  setForm({ ...form, nextDueDate: e.target.value })
                }
              />

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  ✓ Save
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
