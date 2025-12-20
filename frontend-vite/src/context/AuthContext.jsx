import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/sync`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserRole(res.data.user.role); // 🔥 FROM MONGO
      } catch (err) {
        console.error("Role fetch failed", err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    })();
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
