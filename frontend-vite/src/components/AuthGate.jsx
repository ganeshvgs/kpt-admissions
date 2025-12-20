// frontend-vite/src/components/AuthGate.jsx
import { useUser, useAuth } from "@clerk/clerk-react";

export default function AuthGate({ children }) {
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();

  // Clerk JS not ready
  if (!isLoaded) {
    return <p className="text-center mt-20">Loading authentication…</p>;
  }

  // Invite / signup in progress → WAIT
  if (!isSignedIn && !user) {
    return <p className="text-center mt-20">Finalizing your account…</p>;
  }

  // Session exists but user not hydrated yet
  if (!user) {
    return <p className="text-center mt-20">Creating session…</p>;
  }

  // DO NOT BLOCK APP FOR ROLE (Navbar handles it)
  return children;
}
