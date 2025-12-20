import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const ROLES = ["verification_officer", "hod", "principal", "accounts"];

export default function ManageUsers() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Role update failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      {loading ? (
        <p className="text-gray-500">Loading users…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Current Role</th>
                <th className="p-3">Change Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                const isStudent = u.role === "student";

                return (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{u.email}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isAdmin
                            ? "bg-red-100 text-red-700"
                            : isStudent
                            ? "bg-gray-100 text-gray-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      {isAdmin ? (
                        <span className="text-red-500 text-sm font-medium">
                          Admin role locked
                        </span>
                      ) : isStudent ? (
                        <span className="text-gray-500 text-sm">
                          Student role fixed
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateRole(u.id, e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
