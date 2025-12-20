import { Navigate } from "react-router-dom";
import { useAppAuth } from "../context/AuthContext";
import { useUser } from "@clerk/clerk-react";

export default function RequireRole({ allowedRoles, children }) {
  const { user } = useUser();
  const { userRole, loading } = useAppAuth();

  if (!user) return <Navigate to="/" replace />;
  if (loading) return <p className="text-center mt-20">Loading role…</p>;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
