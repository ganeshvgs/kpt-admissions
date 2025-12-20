import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { getToken } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/applications/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplication(res.data.application);
      } catch (err) {
        console.error("Failed to load application");
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  // 🟢 NO APPLICATION YET
  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">
          You have not submitted an application yet.
        </p>

        <Link
          to="/student/application"
          className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Apply for Admission
        </Link>
      </div>
    );
  }

  // 🟢 APPLICATION EXISTS
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Track your admission application status
      </p>

      {/* STATUS */}
      <div className="mt-6 p-4 rounded border bg-gray-50">
        <p className="font-medium">
          Application Status:
          <span
            className={`ml-2 px-2 py-1 rounded text-sm ${
              statusColor(application.status)
            }`}
          >
            {application.status}
          </span>
        </p>
      </div>

      {/* PERSONAL DETAILS */}
      <Section title="Personal Details">
        <Info label="Name" value={application.personalDetails.name} />
        <Info label="DOB" value={application.personalDetails.dob} />
        <Info label="Phone" value={application.personalDetails.phone} />
        <Info label="Address" value={application.personalDetails.address} />
      </Section>

      {/* ACADEMIC DETAILS */}
      <Section title="Academic Details">
        <Info
          label="SSLC Register Number"
          value={application.academicDetails.sslcRegisterNumber}
        />
        <Info
          label="SSLC Marks"
          value={application.academicDetails.sslcMarks}
        />
        <Info
          label="Percentage"
          value={`${application.academicDetails.percentage}%`}
        />
      </Section>

      {/* CATEGORY */}
      <Section title="Category & Reservation">
        <Info
          label="Category"
          value={application.categoryDetails.category}
        />
        <Info
          label="Reservation"
          value={
            application.categoryDetails.reservation.length
              ? application.categoryDetails.reservation.join(", ")
              : "None"
          }
        />
      </Section>

      {/* BRANCH PREFERENCES */}
      <Section title="Branch Preferences">
        <div className="flex flex-wrap gap-2">
          {application.branchPreferences.map((b) => (
            <span
              key={b}
              className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </Section>

      {/* NEXT STEP */}
      <div className="mt-6 p-4 bg-blue-50 border rounded">
        {nextStepMessage(application.status)}
      </div>
    </div>
  );
}

/* ---------- HELPERS ---------- */

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span> {value || "-"}
    </p>
  );
}

function statusColor(status) {
  switch (status) {
    case "SUBMITTED":
      return "bg-yellow-100 text-yellow-700";
    case "VERIFIED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "MERIT_GENERATED":
      return "bg-blue-100 text-blue-700";
    case "SEAT_ALLOTTED":
      return "bg-purple-100 text-purple-700";
    case "ADMITTED":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function nextStepMessage(status) {
  switch (status) {
    case "SUBMITTED":
      return "Your application is submitted. Please wait for document verification.";
    case "VERIFIED":
      return "Your documents are verified. Waiting for merit list.";
    case "MERIT_GENERATED":
      return "Merit list generated. Seat allocation will begin soon.";
    case "SEAT_ALLOTTED":
      return "Seat allotted. Please proceed to fee payment.";
    case "ADMITTED":
      return "Admission complete. Welcome to KPT!";
    case "REJECTED":
      return "Your application was rejected. Please contact admission office.";
    default:
      return "";
  }
}
