import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function VerifyApplications() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // store remarks per application
  const [remarksMap, setRemarksMap] = useState({});

  const fetchApplications = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/verification/applications/${id}`,
        {
          status,
          remarks: remarksMap[id] || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Application ${status.toLowerCase()}`);
      setRemarksMap((prev) => ({ ...prev, [id]: "" }));
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
        Application Verification
      </h2>

      {applications.length === 0 ? (
        <p>No applications to verify</p>
      ) : (
        <table className="w-full border bg-white text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Student Name</th>
              <th className="border p-2">SSLC %</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Remarks</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-50">
                <td className="border p-2">
                  {app.personalDetails?.name}
                </td>

                <td className="border p-2 text-center">
                  {app.academicDetails?.percentage ?? "-"}
                </td>

                <td className="border p-2 text-center">
                  {app.categoryDetails?.category}
                </td>

                <td className="border p-2">
                  <textarea
                    value={remarksMap[app._id] || ""}
                    onChange={(e) =>
                      setRemarksMap((prev) => ({
                        ...prev,
                        [app._id]: e.target.value,
                      }))
                    }
                    placeholder="Enter remarks (required for correction)"
                    className="border p-1 w-full rounded text-xs"
                  />
                </td>

                <td className="border p-2 space-x-2 text-center">
                  <button
                    onClick={() =>
                      updateStatus(app._id, "VERIFIED")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                  >
                    Verify
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(app._id, "REJECTED")
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      if (!remarksMap[app._id]) {
                        toast.error("Remarks required for correction");
                        return;
                      }
                      updateStatus(
                        app._id,
                        "CORRECTION_REQUIRED"
                      );
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Correction
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
