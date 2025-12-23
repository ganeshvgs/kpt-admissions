import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem("userRole") || null
  );
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      setUserRole(null);
      localStorage.removeItem("userRole");
      setLoading(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const fetchRole = async (retries = 3) => {
      try {
        const token = await getToken({ skipCache: true });
        if (!token) throw new Error("Token not ready");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/sync`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserRole(res.data.user.role);
        localStorage.setItem("userRole", res.data.user.role);
      } catch (err) {
        if (retries > 0) {
          setTimeout(() => fetchRole(retries - 1), 800);
          return;
        }
        console.error("Role fetch failed permanently", err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchRole();
  }, [getToken, isSignedIn]);

  return (
    <AuthContext.Provider value={{ userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
