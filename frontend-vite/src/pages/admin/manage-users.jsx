import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

// STRICT ROLES: Only Admin & Verification Officer
const ROLES = ["admin", "verification_officer"];

export default function UserManagement() {
  const { getToken } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // Search state
  
  const [createForm, setCreateForm] = useState({
    email: "",
    role: "verification_officer",
  });
  const [creating, setCreating] = useState(false);

  // --- ACTIONS ---

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      
      // Double check safety: Filter out students on frontend too
      const staffOnly = data.filter(u => u.role !== 'student');
      setUsers(staffOnly);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      toast.success("Staff user created");
      setCreateForm({ email: "", role: "verification_officer" });
      fetchUsers(); 
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error();
      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Role update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic: Search by email
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      {/* --- CREATE USER FORM --- */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Staff</h2>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="staff@college.edu"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {creating ? "Creating..." : "Add User"}
          </button>
        </form>
      </div>

      {/* --- USER LIST --- */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Manage Staff</h1>
            
            {/* Search Input */}
            <input 
                type="text" 
                placeholder="Search staff email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading staff...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                <tr>
                  <th className="p-4 border-b">Email</th>
                  <th className="p-4 border-b">Current Role</th>
                  <th className="p-4 border-b">Update Role</th>
                  <th className="p-4 border-b text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                        {search ? "No matches found." : "No staff found."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role === "admin";
                    
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{u.email}</td>

                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="p-4">
                          {isAdmin ? (
                            <span className="text-xs text-gray-400 italic">Protected</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {!isAdmin && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}