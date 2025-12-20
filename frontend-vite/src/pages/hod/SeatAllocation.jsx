import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";

export default function SeatAllocation() {
  const { getToken } = useAuth();
  const [round, setRound] = useState(1);

  const allocate = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/seats/allocate`,
        { round },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Seat Allocation</h2>

      <label className="block mb-2">Round Number</label>
      <input
        type="number"
        value={round}
        onChange={(e) => setRound(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={allocate}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Allocate Seats
      </button>
    </div>
  );
}
