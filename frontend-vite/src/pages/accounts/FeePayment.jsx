import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function FeePayment() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    receiptNumber: "",
    paymentMode: "cash",
  });

  const fetchStudents = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/fees/verified`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(res.data.applications);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const payFee = async (id) => {
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/fees/pay/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Fee recorded");
      fetchStudents();
    } catch {
      toast.error("Payment failed");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        Fee Payment (Accounts)
      </h2>

      <table className="w-full border bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Student</th>
            <th className="border p-2">Branch</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Receipt</th>
            <th className="border p-2">Mode</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app._id}>
              <td className="border p-2">
                {app.personalDetails.name}
              </td>
              <td className="border p-2">{app.allottedBranch}</td>
              <td className="border p-2">
                <input
                  type="number"
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  className="border p-1"
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      receiptNumber: e.target.value,
                    })
                  }
                  className="border p-1"
                />
              </td>
              <td className="border p-2">
                <select
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMode: e.target.value,
                    })
                  }
                  className="border p-1"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">
                    Net Banking
                  </option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => payFee(app._id)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Pay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
