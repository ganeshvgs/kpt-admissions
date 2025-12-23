import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function MeritList() {
  const { getToken } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/merit/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(res.data.meritList);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Merit List</h2>

      <table className="w-full border bg-white text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">SSLC %</th>
            <th className="border p-2">Merit Score</th>
          </tr>
        </thead>
        <tbody>
          {list.map((app) => (
            <tr key={app._id}>
              <td className="border p-2 text-center">{app.rank}</td>
              <td className="border p-2">{app.personalDetails?.name}</td>
              <td className="border p-2 text-center">
                {app.categoryDetails?.category}
              </td>
              <td className="border p-2 text-center">
                {app.academicDetails?.sslcPercentage}
              </td>
              <td className="border p-2 text-center">
                {app.meritScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
