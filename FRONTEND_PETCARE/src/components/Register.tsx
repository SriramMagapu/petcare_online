import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api";
import "../styles/shared.css";
import "../styles/auth.css";

type Role = "OWNER" | "VET";

export default function Register(): JSX.Element {
  // --- EXISTING STATE & LOGIC ---
  const [role, setRole] = useState<Role>("OWNER");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Owner Fields
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerPhone, setOwnerPhone] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  
  // Vet Fields
  const [vetName, setVetName] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [vetPhone, setVetPhone] = useState<string>("");
  const [clinicAddress, setClinicAddress] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>(""); // "success" | "error" | "loading"

  const navigate = useNavigate();

  const showMessage = (txt: string, type = "error") => {
    setMessage(txt);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const validate = (): boolean => {
    if (!email.trim() || !password.trim()) {
      showMessage("Email and password are required", "error");
      return false;
    }
    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return false;
    }
    if (role === "OWNER") {
      if (!ownerName.trim()) {
        showMessage("Full name is required", "error");
        return false;
      }
    } else {
      if (!vetName.trim() || !clinicName.trim() || !vetPhone.trim() || !clinicAddress.trim()) {
        showMessage("All professional fields are required", "error");
        return false;
      }
    }
    return true;
  };

  const register = async () => {
    clearMessage();
    if (!validate()) return;
    setLoading(true);
    showMessage("Creating account...", "loading");

    try {
      const payload = {
        role,
        email: email.trim().toLowerCase(),
        password,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerAddress: ownerAddress.trim(),
        vetName: vetName.trim(),
        clinicName: clinicName.trim(),
        specialization: specialization.trim(),
        vetPhone: vetPhone.trim(),
        clinicAddress: clinicAddress.trim(),
      };

      const res = await client.post("/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status >= 200 && res.status < 300) {
        showMessage(res.data?.message || "User created successfully!", "success");
        setTimeout(() => {
          clearMessage();
          navigate("/login");
        }, 1400);
      } else {
        showMessage(res.data?.message || `Registration failed (${res.status})`, "error");
      }
    } catch (errRaw) {
      console.error("register error", errRaw);
      const err = errRaw as any;
      const txt = err?.response?.data?.message || err?.message || "Network/server error";
      showMessage(txt, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* --- LEFT PANEL: BRANDING (Ice Blue Paws) --- */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-header">
              <i className="fa-solid fa-paw"></i> PetCare
            </div>
            <h1>Join Our Community!</h1>
            <p className="brand-tagline">
              Create an account to connect with the best veterinarians and manage your pet's well-being seamlessly.
            </p>
          </div>
        </div>

        {/* --- RIGHT PANEL: FORM --- */}
        <div className="auth-form-container">
          <div className="form-header">
            <h2>Create Account</h2>
            <p className="form-sub">Please enter your details to register</p>
          </div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              register();
            }}
          >
            {/* Role Selection */}
            <div className="role-selection">
              <label className="role-radio">
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={role === "OWNER"}
                  onChange={() => {
                    setRole("OWNER");
                    clearMessage();
                  }}
                />
                Pet Owner
              </label>
              <label className="role-radio">
                <input
                  type="radio"
                  name="role"
                  value="VET"
                  checked={role === "VET"}
                  onChange={() => {
                    setRole("VET");
                    clearMessage();
                  }}
                />
                Veterinarian
              </label>
            </div>

            {/* Fields Grid */}
            <div className="form-grid">
              
              {/* --- OWNER FIELDS --- */}
              {role === "OWNER" && (
                <>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="Phone Number"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                  />
                  <input
                    className="form-control full-width"
                    placeholder="Residential Address"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                  />
                </>
              )}

              {/* --- VET FIELDS --- */}
              {role === "VET" && (
                <>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Full Name (Dr. Jane Smith)"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Clinic Name"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Specialization (Optional)"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="Contact Number"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                  />
                  <input
                    className="form-control full-width"
                    placeholder="Clinic Address"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                  />
                </>
              )}

              {/* --- COMMON CREDENTIALS --- */}
              <input
                className="form-control full-width" // Email takes full width
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="form-control full-width" // Password takes full width
                type="password"
                placeholder="Create Password (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Message Area */}
            <div className="message-space" style={{ marginTop: 15 }}>
              {message && (
                <p className={messageType === "success" ? "info-msg" : "error-msg"}>
                  {message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="btn-wrap">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="muted-footer">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}