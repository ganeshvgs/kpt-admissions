import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { Layers, Save } from "lucide-react";

/* SINGLE SOURCE OF TRUTH */
const BRANCHES = [
  { code: "CSE", label: "Computer Science & Engineering" },
  { code: "AE", label: "Automobile Engineering" },
  { code: "ChE", label: "Chemical Engineering" },
  { code: "CE", label: "Civil Engineering" },
  { code: "ECE", label: "Electronics & Communication Engineering" },
  { code: "EEE", label: "Electrical & Electronics Engineering" },
  { code: "ME", label: "Mechanical Engineering" },
  { code: "Poly", label: "Polymer Technology" },
];

export default function SeatManagement() {
  const { getToken } = useAuth();
  const [seats, setSeats] = useState({});
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    const token = await getToken();
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/seats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const seatMap = {};
    const inputMap = {};

    res.data.seats.forEach((s) => {
      seatMap[s.branch] = s;
      inputMap[s.branch] = s.totalSeats;
    });

    setSeats(seatMap);
    setInputs(inputMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const save = async (branch) => {
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/seats`,
        {
          branch,
          totalSeats: Number(inputs[branch]),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${branch} seats updated`);
      fetchSeats();
    } catch (err) {
      toast.error("Failed to update seats");
    }
  };

  if (loading) return <p className="p-6">Loading seats...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Layers className="w-6 h-6 text-blue-600" />
        Seat Management (Admin)
      </h1>

      {BRANCHES.map((b) => (
        <div
          key={b.code}
          className="bg-white border rounded-xl p-5 mb-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <div>
            <p className="font-bold text-lg">{b.label}</p>
            <p className="text-sm text-gray-500">
              Available Seats:{" "}
              <span className="font-semibold">
                {seats[b.code]?.availableSeats ?? 0}
              </span>
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="number"
              min="0"
              value={inputs[b.code] ?? ""}
              onChange={(e) =>
                setInputs({ ...inputs, [b.code]: e.target.value })
              }
              className="border rounded px-3 py-2 w-32"
            />

            <button
              onClick={() => save(b.code)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
