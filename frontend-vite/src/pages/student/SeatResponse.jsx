import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SeatResponse() {
  const { getToken } = useAuth();
  const [seat, setSeat] = useState(null);

  const fetchSeat = async () => {
    const token = await getToken();
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/student/seat`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSeat(res.data.seat);
  };

  const respond = async (response) => {
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/seat/respond`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Response recorded");
      fetchSeat();
    } catch {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    fetchSeat();
  }, []);

  if (!seat) return <p>No seat allotted yet</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Seat Allotment</h2>

      <p><b>Branch:</b> {seat.branch}</p>
      <p><b>Round:</b> {seat.round}</p>

      <div className="mt-4 space-x-2">
        <button
          onClick={() => respond("ACCEPTED")}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Accept
        </button>

        <button
          onClick={() => respond("REJECTED")}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Reject
        </button>

        <button
          onClick={() => respond("UPGRADE_REQUESTED")}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Request Upgrade
        </button>
      </div>
    </div>
  );
}
