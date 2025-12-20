import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function PhysicalVerification() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);

  const fetchStudents = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/physical-verification/accepted`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(res.data.applications);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const verifyDocs = async (id, verified) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/physical-verification/verify/${id}`,
        { verified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Verification updated");
      fetchStudents();
    } catch {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        Physical Document Verification
      </h2>

      {applications.length === 0 ? (
        <p>No students pending verification</p>
      ) : (
        <table className="w-full border bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Student</th>
              <th className="border p-2">Branch</th>
              <th className="border p-2">Rank</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td className="border p-2">
                  {app.personalDetails.name}
                </td>
                <td className="border p-2">
                  {app.allottedBranch}
                </td>
                <td className="border p-2">
                  {app.rank}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => verifyDocs(app._id, true)}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => verifyDocs(app._id, false)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Fail
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
