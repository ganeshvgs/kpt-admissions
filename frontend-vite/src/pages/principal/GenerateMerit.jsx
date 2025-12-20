import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function GenerateMerit() {
  const { getToken } = useAuth();

  const generateMerit = async () => {
    try {
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
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow">
      <h2 className="text-xl font-bold mb-4">
        Merit List Generation
      </h2>

      <button
        onClick={generateMerit}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Generate Merit List
      </button>
    </div>
  );
}
