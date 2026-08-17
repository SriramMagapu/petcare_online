import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerHeader from "./Owner_user/OwnerHeader";
import { apiChangePassword } from "../api";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiChangePassword(oldPassword, newPassword);

      // OPTIONAL: logout after password change (recommended)
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");

      alert("Password changed successfully. Please login again.");
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data || "Old password is incorrect or session expired"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <OwnerHeader />

      <form
        onSubmit={onSubmit}
        style={{
          padding: 30,
          maxWidth: 400,
          margin: "40px auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2>Change Password</h2>

        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
