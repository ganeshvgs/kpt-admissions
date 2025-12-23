import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { Layers, Save } from "lucide-react";

const BRANCHES = ["CSE", "ECE", "EEE", "ME", "CE"];

export default function SeatManagement() {
  const { getToken } = useAuth();
  const [seats, setSeats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    const token = await getToken();
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/seats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const map = {};
    res.data.seats.forEach((s) => (map[s.branch] = s));
    setSeats(map);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const save = async (branch, totalSeats) => {
    const token = await getToken();
    await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/seats`,
      { branch, totalSeats },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(`${branch} updated`);
    fetchSeats();
  };

  if (loading) return <p className="p-6">Loading seats...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Layers className="w-6 h-6 text-blue-600" />
        Manage Seats (Admin)
      </h1>

      {BRANCHES.map((b) => (
        <div
          key={b}
          className="bg-white border rounded p-5 mb-4 flex justify-between items-center"
        >
          <div>
            <p className="font-bold">{b}</p>
            <p className="text-sm text-gray-500">
              Available: {seats[b]?.availableSeats ?? "-"}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="number"
              defaultValue={seats[b]?.totalSeats || ""}
              className="border rounded px-3 py-2 w-32"
              id={`seat-${b}`}
            />
            <button
              onClick={() =>
                save(b, document.getElementById(`seat-${b}`).value)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
