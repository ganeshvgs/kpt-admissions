import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

export default function CreateUser() {
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    email: "",
    role: "verification_officer",
  });

  const roles = [
    "verification_officer",
    "hod",
    "principal",
    "admin",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Staff user created");
      setForm({ email: "", role: "verification_officer" });
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Staff User</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Staff Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Create Staff
        </button>
      </form>
    </div>
  );
}
