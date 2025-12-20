//src/components/DashboardRedirect.jsx
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DashboardRedirect() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/sync`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const role = res.data.user.role;

      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "verification_officer":
          navigate("/verification");
          break;
        case "hod":
          navigate("/hod/allocate");
          break;
        case "principal":
          navigate("/principal/merit");
          break;
        case "accounts":
          navigate("/accounts/fees");
          break;
        default:
          navigate("/student");
      }
    })();
  }, [getToken, navigate]);

  return <p className="text-center mt-20">Redirecting…</p>;
}
