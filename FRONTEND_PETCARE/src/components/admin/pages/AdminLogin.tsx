import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import client from "../../../api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= SEND OTP =================
  const sendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      await client.post("/auth/send-otp", {
        email,
        password,
        login: true,
      });

      setStep("OTP");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await client.post("/auth/verify-otp", {
        email,
        otp,
      });

      const { token, role } = res.data;

      if (role !== "ADMIN") {
        setError("Not an admin account");
        return;
      }

      // ✅ session storage (multi-tab safe)
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);

      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h2>Admin Login</h2>

        {step === "LOGIN" && (
          <>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "OTP" && (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
