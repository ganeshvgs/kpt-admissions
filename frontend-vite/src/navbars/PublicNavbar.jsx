import { Link } from "react-router-dom";
import { SignedOut, SignInButton } from "@clerk/clerk-react";
import { useState } from "react";
import logo from "/logo.jpg";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8 sm:h-9 w-auto" />
        </Link>

        {/* Desktop */}
        <SignedOut>
          <div className="hidden sm:block">
            <SignInButton redirectUrl="/redirect">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="sm:hidden px-4 pb-4">
          <SignedOut>
            <SignInButton redirectUrl="/redirect">
              <button className="w-full bg-indigo-600 text-white py-2 rounded text-sm">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      )}
    </nav>
  );
}
