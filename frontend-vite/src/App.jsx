import { Routes, Route } from "react-router-dom";

import RoleBasedNavbar from "./navbars/RoleBasedNavbar";
import DashboardRedirect from "./components/DashboardRedirect";

import Landing from "./pages/Landing";
import Unauthorized from "./pages/Unauthorized";

import RequireRole from "./auth/RequireRole";

// ADMIN
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/manage-users";
import CreateUser from "./pages/admin/CreateUser";

// STUDENT
import StudentDashboard from "./pages/student/StudentDashboard";
import ApplicationForm from "./pages/student/ApplicationForm";
import SeatResponse from "./pages/student/SeatResponse";

// VERIFICATION
import VerifyApplications from "./pages/verification/VerifyApplications";
import PhysicalVerification from "./pages/verification/PhysicalVerification";

// PRINCIPAL
import GenerateMerit from "./pages/principal/GenerateMerit";
import FinalApproval from "./pages/principal/FinalApproval";

// HOD
import SeatAllocation from "./pages/hod/SeatAllocation";
import MultiRoundAllocation from "./pages/hod/MultiRoundAllocation";

// ACCOUNTS
import FeePayment from "./pages/accounts/FeePayment";

export default function App() {
  return (
    <>
      <RoleBasedNavbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/redirect" element={<DashboardRedirect />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN */}
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

        {/* STUDENT */}
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
        <Route
          path="/student/seat"
          element={
            <RequireRole allowedRoles={["student"]}>
              <SeatResponse />
            </RequireRole>
          }
        />

        {/* VERIFICATION OFFICER */}
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

        {/* PRINCIPAL */}
        <Route
          path="/principal/merit"
          element={
            <RequireRole allowedRoles={["principal"]}>
              <GenerateMerit />
            </RequireRole>
          }
        />
        <Route
          path="/principal/final"
          element={
            <RequireRole allowedRoles={["principal"]}>
              <FinalApproval />
            </RequireRole>
          }
        />

        {/* HOD */}
        <Route
          path="/hod/allocate"
          element={
            <RequireRole allowedRoles={["hod"]}>
              <SeatAllocation />
            </RequireRole>
          }
        />
        <Route
          path="/hod/rounds"
          element={
            <RequireRole allowedRoles={["hod"]}>
              <MultiRoundAllocation />
            </RequireRole>
          }
        />

        {/* ACCOUNTS */}
        <Route
          path="/accounts/fees"
          element={
            <RequireRole allowedRoles={["accounts"]}>
              <FeePayment />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}
