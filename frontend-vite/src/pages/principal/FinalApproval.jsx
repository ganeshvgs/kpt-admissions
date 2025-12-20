import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function FinalApproval() {
  const { getToken } = useAuth();
  const [apps, setApps] = useState([]);
  const [section, setSection] = useState("");

  const fetchApps = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/final/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApps(res.data.applications);
    } catch {
      toast.error("Failed to load applications");
    }
  };

  const approve = async (id) => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/final/approve/${id}`,
        { classSection: section },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Admitted: ${res.data.registerNumber}`);
      fetchApps();
    } catch {
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        Final Admission Approval
      </h2>

      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Student</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Section</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a._id}>
              <td className="border p-2">
                {a.personalDetails.name}
              </td>
              <td className="border p-2">{a.allottedBranch}</td>
              <td className="border p-2">{a.rank}</td>
              <td className="border p-2">
                <input
                  className="border p-1"
                  placeholder="A / B"
                  onChange={(e) => setSection(e.target.value)}
                />
              </td>
              <td className="border p-2">
                <button
                  onClick={() => approve(a._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
