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

  if (!isLoaded) return null;
  if (!user) return <PublicNavbar />;
  if (loading || !userRole) return <LoadingNavbar />;

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
