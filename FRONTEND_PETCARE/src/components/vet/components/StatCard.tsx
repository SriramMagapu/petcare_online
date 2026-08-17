// src/pages/vet/components/StatCard.tsx
import React from "react";
import "./StatCard.css";

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <div className="vetsc-stat-card">
      <div className="vetsc-card-content">
        <div className="vetsc-card-info">
          <div className="vetsc-card-title">{title}</div>
          <div className="vetsc-card-value">{value}</div>
        </div>
        <div 
          className="vetsc-card-icon" 
          style={{ 
            background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
            color: color 
          }}
        >
          {icon}
        </div>
      </div>
      <div 
        className="vetsc-card-accent" 
        style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}00 100%)` }}
      />
    </div>
  );
}