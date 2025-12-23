import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";

export default function DashboardRedirect() {
  const { userRole, loading } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!userRole) return;

    switch (userRole) {
      case "admin":
        navigate("/admin", { replace: true });
        break;
      case "verification_officer":
        navigate("/verification", { replace: true });
        break;
      default:
        navigate("/student", { replace: true });
    }
  }, [userRole, loading, navigate]);

  return <p className="text-center mt-20">Redirecting…</p>;
}
