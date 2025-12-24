import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import logo from "/logo.jpg";

export default function StudentNavbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const active = (path) =>
    pathname.startsWith(path)
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-500";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        <Link to="/student">
          <img src={logo} alt="Logo" className="h-8 sm:h-9 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex gap-6 items-center">
          <Link to="/student" className={active("/student")}>
            Dashboard
          </Link>
          <Link
            to="/student/application"
            className={active("/student/application")}
          >
            Application
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile Button */}
        <button
          className="sm:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="sm:hidden px-4 pb-4 flex flex-col gap-3">
          <Link
            to="/student"
            className={active("/student")}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/student/application"
            className={active("/student/application")}
            onClick={() => setOpen(false)}
          >
            Application
          </Link>
          <div className="pt-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      )}
    </nav>
  );
}
