import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function PhysicalVerification() {
  const { getToken } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});

  /* ================= FETCH ACCEPTED STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/physical-verification/accepted`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error("Failed to load students for verification");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY / FAIL DOCUMENTS ================= */
  const verifyDocs = async (id, verified) => {
    try {
      const token = await getToken();

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/physical-verification/verify/${id}`,
        {
          verified,
          remarks: remarksMap[id] || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        verified
          ? "Documents verified successfully"
          : "Documents marked as failed"
      );

      setRemarksMap((prev) => ({ ...prev, [id]: "" }));
      fetchStudents();
    } catch (err) {
      toast.error("Verification action failed");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Physical Document Verification
      </h2>

      {loading && <p>Loading students...</p>}

      {!loading && applications.length === 0 && (
        <p className="text-gray-600">
          No students pending physical verification.
        </p>
      )}

      {!loading && applications.length > 0 && (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="border rounded-lg bg-white shadow p-5"
            >
              {/* HEADER */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">
                    {app.personalDetails?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Rank: <b>{app.rank}</b> | Branch:{" "}
                    <b>{app.allottedBranch}</b>
                  </p>
                </div>

                <span className="text-sm px-3 py-1 rounded bg-indigo-100 text-indigo-700">
                  Seat Accepted
                </span>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <Info
                  label="Mobile"
                  value={app.personalDetails?.mobile}
                />
                <Info
                  label="Email"
                  value={app.personalDetails?.email}
                />
                <Info
                  label="Category"
                  value={app.categoryDetails?.category}
                />
              </div>

              {/* REMARKS */}
              <div className="mt-4">
                <textarea
                  value={remarksMap[app._id] || ""}
                  onChange={(e) =>
                    setRemarksMap((prev) => ({
                      ...prev,
                      [app._id]: e.target.value,
                    }))
                  }
                  placeholder="Enter remarks (optional)"
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => verifyDocs(app._id, true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Verify Documents
                </button>

                <button
                  onClick={() => verifyDocs(app._id, false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Mark as Failed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Info({ label, value }) {
  return (
    <p>
      <span className="font-medium">{label}:</span>{" "}
      {value || "-"}
    </p>
  );
}
