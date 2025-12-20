import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

export default function MultiRoundAllocation() {
  const { getToken } = useAuth();
  const [round, setRound] = useState(2);

  const runRound = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/seats/allocate/round`,
        { round },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
    } catch {
      toast.error("Round allocation failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow">
      <h2 className="text-xl font-bold mb-4">
        Multi-Round Seat Allocation
      </h2>

      <input
        type="number"
        value={round}
        onChange={(e) => setRound(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={runRound}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Run Round {round}
      </button>
    </div>
  );
}
