import { Routes, Route } from "react-router-dom";

import RoleBasedNavbar from "./navbars/RoleBasedNavbar";
import DashboardRedirect from "./components/DashboardRedirect";

import Landing from "./pages/Landing";
import Unauthorized from "./pages/Unauthorized";

import RequireRole from "./auth/RequireRole";

// ================= ADMIN =================
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/manage-users";
import CreateUser from "./pages/admin/CreateUser";

// ================= STUDENT =================
import StudentDashboard from "./pages/student/StudentDashboard";
import ApplicationForm from "./pages/student/ApplicationForm";

// ================= VERIFICATION =================
import VerifyApplications from "./pages/verification/VerifyApplications";
import PhysicalVerification from "./pages/verification/PhysicalVerification";
import GenerateMerit from "./pages/verification/GenerateMerit";
import FinalApproval from "./pages/verification/FinalApproval";
import MeritList from "./pages/verification/MeritList";
import SeatAllocation from "./pages/verification/SeatAllocation";

export default function App() {
  return (
    <>
      <RoleBasedNavbar />

      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/" element={<Landing />} />
        <Route path="/redirect" element={<DashboardRedirect />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ===== ADMIN ===== */}
        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="create-user" element={<CreateUser />} />
        </Route>

        {/* ===== STUDENT ===== */}
        <Route
          path="/student"
          element={
            <RequireRole allowedRoles={["student"]}>
              <StudentDashboard />
            </RequireRole>
          }
        />

        <Route
          path="/student/application"
          element={
            <RequireRole allowedRoles={["student"]}>
              <ApplicationForm />
            </RequireRole>
          }
        />

        {/* ===== VERIFICATION OFFICER ===== */}
        <Route
          path="/verification"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <VerifyApplications />
            </RequireRole>
          }
        />

        <Route
          path="/verification/physical"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <PhysicalVerification />
            </RequireRole>
          }
        />

        <Route
          path="/verification/merit"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <GenerateMerit />
            </RequireRole>
          }
        />

        <Route
          path="/verification/final"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <FinalApproval />
            </RequireRole>
          }
        />

        <Route
          path="/verification/merit-list"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <MeritList />
            </RequireRole>
          }
        />

        <Route
          path="/verification/seat-allocation"
          element={
            <RequireRole allowedRoles={["verification_officer"]}>
              <SeatAllocation />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}
