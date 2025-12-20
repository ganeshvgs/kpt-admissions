import { useUser } from "@clerk/clerk-react";
import { useAppAuth } from "../context/AuthContext";

import PublicNavbar from "./PublicNavbar";
import StudentNavbar from "./StudentNavbar";
import AdminNavbar from "./AdminNavbar";
import VerificationNavbar from "./VerificationNavbar";
import HodNavbar from "./HodNavbar";
import PrincipalNavbar from "./PrincipalNavbar";
import AccountsNavbar from "./AccountsNavbar";
import LoadingNavbar from "./LoadingNavbar";

export default function RoleBasedNavbar() {
  const { user, isLoaded } = useUser();
  const { userRole, loading } = useAppAuth();

  // Clerk not ready
  if (!isLoaded) return null;

  // Not logged in
  if (!user) return <PublicNavbar />;

  // 🔥 Logged in but Mongo role NOT READY
  if (loading || !userRole) {
    return <LoadingNavbar />;
  }

  // Role ready → correct navbar
  switch (userRole) {
    case "admin":
      return <AdminNavbar />;
    case "verification_officer":
      return <VerificationNavbar />;
    case "hod":
      return <HodNavbar />;
    case "principal":
      return <PrincipalNavbar />;
    case "accounts":
      return <AccountsNavbar />;
    case "student":
      return <StudentNavbar />;
    default:
      return <StudentNavbar />;
  }
}
