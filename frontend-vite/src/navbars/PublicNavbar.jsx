import { Link } from "react-router-dom";
import { SignedOut, SignInButton } from "@clerk/clerk-react";

export default function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-700">
          KPT Admissions
        </Link>

        <SignedOut>
          <SignInButton redirectUrl="/redirect">
            <button className="bg-indigo-600 text-white px-4 py-1.5 rounded">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
