import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaUserGraduate, 
  FaClipboardList, 
  FaCheckDouble, 
  FaSync, 
  FaExclamationTriangle,
  FaArrowRight,
  FaUniversity,
  FaUserCheck,
  FaTimesCircle
} from "react-icons/fa";

export default function OfficerDashboard() {
  const { getToken, user } = useAuth();
  const navigate = useNavigate();

  // State for REAL data from your new endpoint
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingVerification: 0,
    verified: 0,
    rejected: 0,
    correctionRequired: 0,
    physicallyVerified: 0,
    finalAdmitted: 0
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Hitting the new endpoint we just created in verification.routes.js
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load officer statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate generic progress (Online Verification Completion)
  const workloadProgress = stats.totalApplications > 0 
    ? Math.round(((stats.verified + stats.rejected) / stats.totalApplications) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Officer Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            <span className="font-semibold text-indigo-600">{user?.firstName}</span>, here is today's admission summary.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 transition"
        >
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh Stats
        </button>
      </div>

      {/* 1. KEY METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Pending Online Review" 
          value={stats.pendingVerification} 
          icon={<FaClipboardList />} 
          color="bg-orange-500" 
          subLabel="Applications waiting"
        />
        <StatCard 
          label="Corrections Sent" 
          value={stats.correctionRequired} 
          icon={<FaExclamationTriangle />} 
          color="bg-yellow-500" 
          subLabel="Student action needed"
        />
        <StatCard 
          label="Ready for Admission" 
          value={stats.verified} 
          icon={<FaUserCheck />} 
          color="bg-blue-500" 
          subLabel="Online Verified"
        />
        <StatCard 
          label="Final Admissions" 
          value={stats.finalAdmitted} 
          icon={<FaUserGraduate />} 
          color="bg-green-600" 
          subLabel="Students in class"
        />
      </div>

      {/* 2. PROGRESS BAR (Workload) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">Online Verification Progress</h3>
          <span className="text-sm font-bold text-indigo-600">{workloadProgress}% Processed</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-indigo-600 h-3 rounded-full transition-all duration-1000" 
            style={{ width: `${workloadProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {stats.totalApplications} Total Received • {stats.rejected} Rejected
        </p>
      </div>

      {/* 3. QUICK ACCESS MODULES */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">Officer Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Online Verification */}
        <NavCard 
          title="Verify Applications"
          desc="Review uploaded documents (Marks cards, Caste certs) and approve or request corrections."
          icon={<FaClipboardList className="text-blue-600" />}
          onClick={() => navigate("/verification")}
          badge={stats.pendingVerification > 0 ? stats.pendingVerification : null}
          badgeColor="bg-orange-100 text-orange-700"
        />

        {/* Module 2: Merit & Allocation */}
        <NavCard 
          title="Merit & Allocation"
          desc="Generate Merit Lists and run the Seat Allocation algorithm for eligible students."
          icon={<FaUniversity className="text-purple-600" />}
          onClick={() => navigate("/verification/merit")}
        />

        {/* Module 3: Physical Verification */}
        <NavCard 
          title="Admission Counter"
          desc="Verify original physical documents and finalize student admission."
          icon={<FaCheckDouble className="text-indigo-600" />}
          onClick={() => navigate("/verification/physical")}
          badge={stats.verified > 0 ? `${stats.verified} Ready` : null}
          badgeColor="bg-green-100 text-green-700"
        />

        {/* Module 4: Final Approval */}
        <NavCard 
          title="Final Approval"
          desc="Assign Register Numbers, Sections, and generate Admission Orders."
          icon={<FaUserGraduate className="text-teal-600" />}
          onClick={() => navigate("/verification/final")}
        />

      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function StatCard({ label, value, icon, color, subLabel }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value !== undefined ? value.toLocaleString() : "0"}
          </p>
          {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg shadow-sm ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function NavCard({ title, desc, icon, onClick, badge, badgeColor }) {
  return (
    <div 
      onClick={onClick}
      className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 cursor-pointer transition-all relative"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      {/* Arrow Icon */}
      <div className="absolute bottom-5 right-5 text-gray-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all">
        <FaArrowRight />
      </div>

      {/* Dynamic Badge */}
      {badge && (
        <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-md border ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
          {badge}
        </span>
      )}
    </div>
  );
}