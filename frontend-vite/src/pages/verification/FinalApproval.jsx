import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUserGraduate, FaCheckDouble, FaIdCard } from "react-icons/fa";

export default function FinalApproval() {
  const { getToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | ADMITTED
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Local state for inputs in the table
  const [sections, setSections] = useState({});

  const fetchApps = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/final/pending`,
        { 
            headers: { Authorization: `Bearer ${token}` },
            params: { status: activeTab === "PENDING" ? "" : "ADMITTED" }
        }
      );
      setApps(res.data.applications);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [activeTab]);

  const approve = async (id, studentName) => {
    const section = sections[id] || "A"; // Default Section A if empty
    
    if(!window.confirm(`Confirm admission for ${studentName} in Section ${section}?`)) return;

    try {
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/final/approve/${id}`,
        { classSection: section },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(res.data.message);
      fetchApps(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserGraduate className="text-indigo-600" /> Final Admission
          </h2>
          <p className="text-gray-500">Generate Register Numbers & Assign Sections</p>
        </div>
        
        {/* TABS */}
        <div className="bg-white border rounded-lg p-1 flex shadow-sm">
            <TabButton 
                active={activeTab === "PENDING"} 
                onClick={() => setActiveTab("PENDING")} 
                label="Pending Approval" 
                count={activeTab === "PENDING" ? apps.length : null}
            />
            <TabButton 
                active={activeTab === "ADMITTED"} 
                onClick={() => setActiveTab("ADMITTED")} 
                label="Admitted History" 
            />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-gray-500">Loading records...</div>
        ) : apps.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">No students found in this category.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4 border-b">Rank</th>
                            <th className="p-4 border-b">Student Details</th>
                            <th className="p-4 border-b">Allotted Seat</th>
                            <th className="p-4 border-b">Category</th>
                            {activeTab === "PENDING" ? (
                                <>
                                    <th className="p-4 border-b w-32">Assign Section</th>
                                    <th className="p-4 border-b w-40 text-center">Action</th>
                                </>
                            ) : (
                                <>
                                    <th className="p-4 border-b">Section</th>
                                    <th className="p-4 border-b">Reg Number</th>
                                    <th className="p-4 border-b text-center">Status</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {apps.map((app) => (
                            <tr key={app._id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-bold text-gray-500">#{app.rank}</td>
                                <td className="p-4">
                                    <p className="font-bold text-gray-900">{app.personalDetails.name}</p>
                                    <p className="text-xs text-gray-500">{app.personalDetails.mobile}</p>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-medium text-xs border border-indigo-100">
                                        {app.allottedBranch}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{app.categoryDetails.category}</td>
                                
                                {activeTab === "PENDING" ? (
                                    <>
                                        <td className="p-4">
                                            <select 
                                                className="w-full border rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={sections[app._id] || ""}
                                                onChange={(e) => setSections({...sections, [app._id]: e.target.value})}
                                            >
                                                <option value="" disabled selected>Select</option>
                                                <option value="A">Section A</option>
                                                <option value="B">Section B</option>
                                                <option value="C">Section C</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => approve(app._id, app.personalDetails.name)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 w-full"
                                            >
                                                <FaCheckDouble /> Approve
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-medium">{app.finalAdmission?.classSection}</td>
                                        <td className="p-4 font-mono font-bold text-indigo-600">
                                            {app.finalAdmission?.registerNumber}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center justify-center gap-1 mx-auto w-fit">
                                                <FaIdCard /> Admitted
                                            </span>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
    return (
        <button 
            onClick={onClick}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                active 
                ? "bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
            {label}
            {count !== null && count !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${active ? "bg-indigo-200 text-indigo-800" : "bg-gray-200 text-gray-600"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}