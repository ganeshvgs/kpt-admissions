import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

export default function HodNavbar() {
  const { pathname } = useLocation();

  const active = (path) =>
    pathname.startsWith(path)
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-500";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-indigo-700">HOD Panel</h1>

        <div className="flex gap-6 items-center">
          <Link to="/hod/allocate" className={active("/hod/allocate")}>
            Seat Allocation
          </Link>
          <Link to="/hod/rounds" className={active("/hod/rounds")}>
            Allocation Rounds
          </Link>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
