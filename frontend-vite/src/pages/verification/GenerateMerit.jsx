import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function GenerateMerit() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateMerit = async () => {
    const confirm = window.confirm(
      "⚠️ This will generate ranks for ALL verified students.\nThis action cannot be undone.\n\nDo you want to continue?"
    );

    if (!confirm) return;

    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/merit/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Merit generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Merit List Management
        </h2>
        <p className="text-gray-600 mt-1">
          Verification Officer Panel
        </p>
      </div>

      {/* INFO CARD */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Before generating merit:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>All student applications must be <b>VERIFIED</b></li>
          <li>Merit is calculated using <b>SSLC percentage + category bonus</b></li>
          <li>Ranks will be permanently assigned</li>
        </ul>
      </div>

      {/* ACTION CARD */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Actions
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          {/* GENERATE MERIT */}
          <button
            onClick={generateMerit}
            disabled={loading}
            className={`flex-1 py-3 rounded font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Generating Merit..." : "Generate Merit List"}
          </button>

          {/* VIEW MERIT */}
          <Link
            to="/verification/merit-list"
            className="flex-1 py-3 rounded font-semibold text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            View Merit List
          </Link>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-xs text-gray-500 text-center">
        ⚠️ Merit generation should be done only once after verification is complete.
      </p>
    </div>
  );
}
