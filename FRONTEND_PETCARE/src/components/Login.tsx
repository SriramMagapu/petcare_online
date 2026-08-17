import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api";
import "../styles/shared.css";
import "../styles/auth.css";
import { apiGetOwnerProfile } from "../api";

type Step = "enterCredentials" | "verifyOtp";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("enterCredentials");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ CLEAR OLD TOKENS WHEN LOGIN PAGE LOADS
  useEffect(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("owner");
    localStorage.removeItem("token");
  }, []);

  // ================= SEND OTP =================
  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await client.post("/auth/send-otp", {
        email: email.trim(),
        password,
        login: true,
      });

      setMessage(res.data?.message || "OTP sent");
      setStep("verifyOtp");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await client.post("/auth/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });

      const { token, role } = res.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);

      if (role === "OWNER") {
        const owner = await apiGetOwnerProfile();

        sessionStorage.setItem(
          "owner",
          JSON.stringify({
            name: owner.name,
            email: owner.email,
            photoPath: owner.photoPath,
          })
        );

        navigate("/owner/home", { replace: true });
      } else if (role === "VET") {
        navigate("/vet/dashboard", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT PANEL */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="brand-header">
              <i className="fa-solid fa-paw"></i> PetCare
            </div>
            <h1>Welcome Back!</h1>
            <p className="brand-tagline">
              Log in to access your dashboard, manage your pet's health, and track appointments.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-form-container">
          <div className="form-header">
            <h2>LOG IN</h2>
          </div>

          {step === "enterCredentials" && (
            <form className="auth-form" onSubmit={sendOtp}>
              <div className="input-group">
                <input
                  className="form-control"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  className="form-control"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="message-space">
                {message && <p className="error-msg">{message}</p>}
              </div>

              <div className="btn-wrap">
                <button className="primary-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "verifyOtp" && (
            <form className="auth-form" onSubmit={verifyOtp}>
              <div style={{ textAlign: "center", marginBottom: "1rem", color: "#6b7280" }}>
                <small>Enter the 6-digit code sent to your email</small>
              </div>

              <div className="input-group">
                <input
                  className="form-control"
                  placeholder="Enter OTP Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="message-space">
                {message && <p className="error-msg">{message}</p>}
              </div>

              <div className="btn-wrap">
                <button className="primary-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            </form>
          )}

          <div className="muted-footer">
            New to the platform? <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
