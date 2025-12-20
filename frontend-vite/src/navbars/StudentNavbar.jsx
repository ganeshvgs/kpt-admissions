import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

export default function StudentNavbar() {
  const { pathname } = useLocation();

  const active = (path) =>
    pathname.startsWith(path)
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-500";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-indigo-700">Student Portal</h1>

        <div className="flex gap-6 items-center">
          <Link to="/student" className={active("/student")}>
            Dashboard
          </Link>
          <Link to="/student/application" className={active("/student/application")}>
            Application
          </Link>
          <Link to="/student/seat" className={active("/student/seat")}>
            Seat Status
          </Link>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
