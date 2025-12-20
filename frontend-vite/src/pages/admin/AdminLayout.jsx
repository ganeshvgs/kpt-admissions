import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function AdminLayout() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/sync`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.user.role !== "admin") {
          navigate("/unauthorized");
        } else {
          setLoading(false);
        }
      } catch {
        navigate("/");
      }
    })();
  }, []);

  if (loading) return <p className="mt-20 text-center">Checking admin…</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Outlet />
    </div>
  );
}
