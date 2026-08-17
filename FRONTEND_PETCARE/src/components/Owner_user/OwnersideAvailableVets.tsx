import React, { useEffect, useState } from "react";
import OwnerHeader from "./OwnerHeader";
import { apiFetchVets, type VetPublic } from "../../api";
import "../../styles/OwnerSideVetList.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function AvailableVets() {
  const [vets, setVets] = useState<VetPublic[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");

  useEffect(() => {
    apiFetchVets()
      .then(setVets)
      .finally(() => setLoading(false));
  }, []);

  // Automatically extract unique specializations for the dropdown
  const specializations = ["All", ...new Set(vets.map(v => v.specialization).filter(Boolean))];

  const filteredVets = vets.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.clinicName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = activeSpec === "All" || v.specialization === activeSpec;
    return matchesSearch && matchesSpec;
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="v-page-container">
      <main className="v-content">
        <OwnerHeader />

        <header className="v-header">
          <h1 className="v-title">Available Veterinarians</h1>
          <p className="v-subtitle">Connect with certified specialists to provide the best care for your beloved pets.</p>
        </header>

        {/* REFINED FILTER SECTION WITH DROPDOWN */}
        <div className="v-filter-section">
          <input 
            type="text" 
            className="v-search-input" 
            placeholder="Search by veterinarian, clinic, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select 
            className="v-spec-dropdown"
            value={activeSpec}
            onChange={(e) => setActiveSpec(e.target.value)}
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="v-grid-container">
          <div className="v-grid">
            {filteredVets.map(v => (
              <div key={v.id} className="v-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                    {getInitials(v.name || "Vet")}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{v.name}</h3>
                    <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {v.specialization || "General"}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '2px solid #f8fafc', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.95rem', color: '#475569' }}>
                    <i className="fa-solid fa-hospital" style={{ color: '#3b82f6' }}></i>
                    <span><strong>Clinic:</strong> {v.clinicName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.95rem', color: '#475569' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: '#3b82f6' }}></i>
                    <span><strong>Address:</strong> {v.clinicAddress}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.95rem', color: '#475569' }}>
                    <i className="fa-solid fa-phone" style={{ color: '#3b82f6' }}></i>
                    <span><strong>Phone:</strong> {v.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}