import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SeatAllocation() {
  const { getToken } = useAuth();

  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const allocateSeats = async () => {
    const confirm = window.confirm(
      `⚠️ Allocate seats for ROUND ${round}?\n\nThis will allot seats based on rank & preferences.`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/seats/allocate`,
        { round },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message);
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Seat allocation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-indigo-700">
          Seat Allocation
        </h1>
        <p className="text-gray-600">
          Verification Officer / Admin Panel
        </p>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <ul className="list-disc ml-5 space-y-1 text-blue-900">
          <li>Merit list must be generated</li>
          <li>Seats will be allotted by rank & preferences</li>
          <li>Students must accept seats after allocation</li>
        </ul>
      </div>

      {/* ACTION CARD */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Allocation Round
          </label>
          <input
            type="number"
            min="1"
            value={round}
            onChange={(e) => setRound(Number(e.target.value))}
            className="border rounded px-3 py-2 w-32"
          />
        </div>

        <button
          onClick={allocateSeats}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Allocating Seats..." : "Allocate Seats"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ Allocation Completed
          </h3>
          <p>Total Allocated: <b>{result.allocated}</b></p>
          <p>Round: <b>{round}</b></p>
        </div>
      )}
    </div>
  );
}
