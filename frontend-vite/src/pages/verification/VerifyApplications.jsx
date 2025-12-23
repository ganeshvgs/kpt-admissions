import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function VerifyApplications() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [openId, setOpenId] = useState(null); // 👈 controls expanded view

  const fetchApplications = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data.applications);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken();

      if (status === "CORRECTION_REQUIRED" && !remarksMap[id]) {
        toast.error("Remarks are required for correction");
        return;
      }

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/verification/applications/${id}`,
        { status, remarks: remarksMap[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Application ${status.toLowerCase()}`);
      setRemarksMap((prev) => ({ ...prev, [id]: "" }));
      setOpenId(null);
      fetchApplications();
    } catch {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) return <p className="p-6">Loading applications...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Verification Officer – Applications
      </h2>

      {applications.length === 0 && (
        <p>No applications pending verification.</p>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          const isOpen = openId === app._id;

          return (
            <div
              key={app._id}
              className="border rounded-lg bg-white shadow-sm"
            >
              {/* ================= COMPACT CARD ================= */}
              <div className="flex items-center gap-4 p-4">
                {/* PHOTO */}
                <div className="w-16 h-20 border rounded overflow-hidden bg-gray-50">
                  {app.personalDetails?.photo ? (
                    <img
                      src={app.personalDetails.photo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No Photo
                    </div>
                  )}
                </div>

                {/* QUICK INFO */}
                <div className="flex-1 text-sm">
                  <p className="font-semibold">
                    {app.personalDetails?.name}
                  </p>
                  <p className="text-gray-600">
                    {app.admissionType} • Category:{" "}
                    {app.categoryDetails?.category}
                  </p>
                  <p className="text-gray-600">
                    SSLC %:{" "}
                    {app.academicDetails?.sslcPercentage ?? "-"}
                  </p>
                </div>

                {/* BRANCHES */}
                <div className="hidden md:flex gap-2">
                  {app.branchPreferences.slice(0, 2).map((b) => (
                    <span
                      key={b}
                      className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs"
                    >
                      {b}
                    </span>
                  ))}
                  {app.branchPreferences.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{app.branchPreferences.length - 2} more
                    </span>
                  )}
                </div>

                {/* VIEW BUTTON */}
                <button
                  onClick={() =>
                    setOpenId(isOpen ? null : app._id)
                  }
                  className="text-indigo-600 font-medium text-sm"
                >
                  {isOpen ? "Hide Details" : "View Details"}
                </button>
              </div>

              {/* ================= EXPANDED DETAILS ================= */}
              {isOpen && (
                <div className="border-t p-6 space-y-6 bg-gray-50">
                  {/* PERSONAL */}
                  <Section title="Personal Details">
                    <Info label="DOB" value={app.personalDetails?.dob} />
                    <Info label="Mobile" value={app.personalDetails?.mobile} />
                    <Info label="Email" value={app.personalDetails?.email} />
                    <Info label="Gender" value={app.personalDetails?.gender} />
                    <Info label="Religion" value={app.personalDetails?.religion} />
                    <Info label="Nationality" value={app.personalDetails?.nationality} />
                    <Info label="SATS No" value={app.personalDetails?.satsNumber} />
                  </Section>

                  {/* ACADEMIC */}
                  <Section title="Academic Details">
                    <Info
                      label="SSLC Register No"
                      value={app.academicDetails?.sslcRegisterNumber}
                    />
                    <Info
                      label="SSLC Percentage"
                      value={
                        app.academicDetails?.sslcPercentage
                          ? `${app.academicDetails.sslcPercentage}%`
                          : "-"
                      }
                    />
                    <Info
                      label="Maths Marks"
                      value={app.academicDetails?.mathsMarks}
                    />
                    <Info
                      label="Science Marks"
                      value={app.academicDetails?.scienceMarks}
                    />
                  </Section>

                  {/* CATEGORY */}
                  <Section title="Category & Reservation">
                    <Info label="Category" value={app.categoryDetails?.category} />
                    <Info label="Caste" value={app.categoryDetails?.casteName} />
                    <Info
                      label="Annual Income"
                      value={app.categoryDetails?.annualIncome}
                    />
                    <Info
                      label="Rural"
                      value={app.categoryDetails?.isRural ? "Yes" : "No"}
                    />
                    <Info
                      label="Kannada Medium"
                      value={app.categoryDetails?.isKannadaMedium ? "Yes" : "No"}
                    />
                  </Section>

                  {/* BRANCHES */}
                  <Section title="Branch Preferences">
                    <div className="flex flex-wrap gap-2">
                      {app.branchPreferences.map((b, i) => (
                        <span
                          key={b}
                          className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-sm"
                        >
                          {i + 1}. {b}
                        </span>
                      ))}
                    </div>
                  </Section>

                  {/* REMARKS */}
                  <textarea
                    value={remarksMap[app._id] || ""}
                    onChange={(e) =>
                      setRemarksMap((prev) => ({
                        ...prev,
                        [app._id]: e.target.value,
                      }))
                    }
                    placeholder="Enter remarks (required for correction)"
                    className="w-full border rounded p-2 text-sm"
                  />

                  {/* ACTIONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(app._id, "VERIFIED")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => updateStatus(app._id, "REJECTED")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(app._id, "CORRECTION_REQUIRED")
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                      Correction
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        {children}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span>{" "}
      {value !== undefined && value !== "" ? value : "-"}
    </p>
  );
}
