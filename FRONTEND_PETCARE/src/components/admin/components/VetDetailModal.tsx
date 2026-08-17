import { useEffect, useState } from "react";
import client from "../../../api";
import "./DetailModal.css"; // Also uses the new shared stylesheet

interface Vet {
  name: string;
  email: string;
  specialization: string;
  approved: boolean;
}

interface VetDetailModalProps {
  userId: number;
  onClose: () => void;
}

export default function VetDetailModal({ userId, onClose }: VetDetailModalProps) {
  const [vet, setVet] = useState<Vet | null>(null);

  useEffect(() => {
    // API logic is unchanged
    client.get(`/api/admin/vets/${userId}`).then(res => {
      setVet(res.data);
    });
  }, [userId]);

  async function approveVet() {
    // API logic is unchanged
    await client.put(`/api/admin/vets/${userId}/approve`);
    onClose();
  }

  async function blockVet() {
    // API logic is unchanged
    await client.put(`/api/admin/vets/${userId}/block`);
    onClose();
  }

  if (!vet) {
    return (
      <div className="modal-backdrop">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Vet Details</h3>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{vet.name}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{vet.email}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Specialization</span>
            <span className="detail-value">{vet.specialization}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Account Status</span>
            <span className={`status-pill ${vet.approved ? "approved" : "pending"}`}>
              {vet.approved ? "Active" : "Pending Approval"}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {!vet.approved && (
            <button className="btn btn-primary" onClick={approveVet}>Approve</button>
          )}
          <button className="btn btn-danger" onClick={blockVet}>Block User</button>
        </div>
      </div>
    </div>
  );
}