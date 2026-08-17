// src/pages/vet/components/StatusBadge.tsx
import React from "react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config: any = {
    REQUESTED: { bg: "#fef3c7", color: "#92400e", text: "Pending" },
    APPROVED: { bg: "#d1fae5", color: "#065f46", text: "Accepted" },
    COMPLETED: { bg: "#dbeafe", color: "#1e40af", text: "Completed" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b", text: "Rejected" }
  };

  const s = config[status] || config.REQUESTED;

  return (
    <span className="vet-status-badge" style={{ background: s.bg, color: s.color }}>
      {s.text}
    </span>
  );
}