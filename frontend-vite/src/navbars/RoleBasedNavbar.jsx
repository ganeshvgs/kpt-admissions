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

  // ✅ 1. Clerk not loaded yet → show skeleton (NO BLANK)
  if (!isLoaded) {
    return <LoadingNavbar />;
  }

  // ✅ 2. User not logged in → public navbar
  if (!user) {
    return <PublicNavbar />;
  }

  // ✅ 3. Logged in but role still loading → skeleton
  if (loading || !userRole) {
    return <LoadingNavbar />;
  }

  // ✅ 4. Role-based navbar
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
