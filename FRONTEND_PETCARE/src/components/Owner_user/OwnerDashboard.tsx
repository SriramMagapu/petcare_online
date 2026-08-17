import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/owner/home");
  }, []);

  return null;
}
