import React from "react";
import { Navigate } from "react-router-dom";

export type Role = "OWNER" | "VET" | "ADMIN";

interface ProtectedRouteProps {
  children: JSX.Element;
  role?: Role;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const token = sessionStorage.getItem("token");
  const storedRole = sessionStorage.getItem("role") as Role | null;

  if (!token || !storedRole) {
    return <Navigate to="/login" replace />;
  }

  if (role && storedRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
