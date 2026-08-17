import { useEffect, useState } from "react";
import client from "../../../api";
import "./DetailModal.css"; // Uses the new shared stylesheet

interface Pet {
  id: number;
  name: string;
}

interface Owner {
  name: string;
  email: string;
  createdAt: string;
  pets: Pet[];
  petCount: number;
}

interface OwnerDetailModalProps {
  userId: number;
  onClose: () => void;
}

export default function OwnerDetailModal({ userId, onClose }: OwnerDetailModalProps) {
  const [owner, setOwner] = useState<Owner | null>(null);

  useEffect(() => {
    // API logic is unchanged
    client.get(`/api/admin/users/${userId}`).then(res => {
      setOwner(res.data);
    });
  }, [userId]);

  if (!owner) {
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
          <h3>Owner Details</h3>
        </div>
        
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{owner.name}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{owner.email}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Registered</span>
            <span className="detail-value">
              {new Date(owner.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="detail-label">Registered Pets ({owner.pets.length})</span>
            <div className="pet-list">
              {owner.pets.length > 0 ? (
                owner.pets.map((pet) => (
                  <div key={pet.id} className="pet-item">
                    <i className="fa-solid fa-paw"></i>
                    <span>{pet.name}</span>
                  </div>
                ))
              ) : (
                <span className="detail-value">No pets registered.</span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}