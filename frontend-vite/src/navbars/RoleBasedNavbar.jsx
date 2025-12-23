import { useUser } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";

import PublicNavbar from "./PublicNavbar";
import StudentNavbar from "./StudentNavbar";
import AdminNavbar from "./AdminNavbar";
import VerificationNavbar from "./VerificationNavbar";
import LoadingNavbar from "./LoadingNavbar";

export default function RoleBasedNavbar() {
  const { user, isLoaded } = useUser();
  const { userRole, loading } = useAppAuth();

  // Clerk not ready
  if (!isLoaded) return null;

  // Not logged in
  if (!user) return <PublicNavbar />;

  // Mongo role still loading
  if (loading || !userRole) {
    return <LoadingNavbar />;
  }

  // Role-based navbar
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
