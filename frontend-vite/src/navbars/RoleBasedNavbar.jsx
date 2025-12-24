import { useUser } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom"; // 1. Import useLocation

import PublicNavbar from "./PublicNavbar";
import StudentNavbar from "./StudentNavbar";
import AdminNavbar from "./AdminNavbar";
import VerificationNavbar from "./VerificationNavbar";
import LoadingNavbar from "./LoadingNavbar";

export default function RoleBasedNavbar() {
  const { user, isLoaded } = useUser();
  const { userRole, loading } = useAppAuth();
  const location = useLocation(); // 2. Get the current location

  if (!isLoaded) return null;
  if (!user) return <PublicNavbar />;
  if (loading || !userRole) return <LoadingNavbar />;

  // 3. LOGIC: If we are on the Officer Dashboard, return null (Hide Navbar)
  if (location.pathname === "/verification/dashboard") {
    return null;
  }

  switch (userRole) {
    case "admin":
      return <AdminNavbar />;
    case "verification_officer":
      return <VerificationNavbar />;
    case "student":
      return <StudentNavbar />;
    default:
      return <StudentNavbar />;
  }
}