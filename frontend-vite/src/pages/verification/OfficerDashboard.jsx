import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { 
  FaHome, 
  FaClipboardCheck, 
  FaTrophy, 
  FaChair, 
  FaUserCheck, 
  FaUserGraduate,
  FaBars,
  FaSignOutAlt
} from "react-icons/fa";

// IMPORT YOUR EXISTING COMPONENTS HERE
import VerifyApplications from "./VerifyApplications";
import MeritManagement from "./GenerateMerit";
import SeatAllocation from "./SeatAllocation";
import PhysicalVerification from "./PhysicalVerification";
import FinalApproval from "./FinalApproval";

export default function OfficerDashboard() {
  const [activeView, setActiveView] = useState("DASHBOARD");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { signOut } = useAuth();

  // Navigation Items
  const navItems = [
    { id: "DASHBOARD", label: "Overview", icon: <FaHome /> },
    { id: "VERIFY", label: "1. Online Verification", icon: <FaClipboardCheck /> },
    { id: "MERIT", label: "2. Merit Generation", icon: <FaTrophy /> },
    { id: "SEATS", label: "3. Seat Allocation", icon: <FaChair /> },
    { id: "PHYSICAL", label: "4. Physical Reporting", icon: <FaUserCheck /> },
    { id: "FINAL", label: "5. Final Admission", icon: <FaUserGraduate /> },
  ];

  // Render Logic
  const renderContent = () => {
    switch (activeView) {
      case "DASHBOARD": return <DashboardHome onChangeView={setActiveView} />;
      case "VERIFY": return <VerifyApplications />;
      case "MERIT": return <MeritManagement />;
      case "SEATS": return <SeatAllocation />;
      case "PHYSICAL": return <PhysicalVerification />;
      case "FINAL": return <FinalApproval />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-indigo-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-indigo-800">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold tracking-wider">OFFICER PORTAL</h1>
          ) : (
            <span className="text-xl font-bold">OP</span>
          )}
        </div>

        <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-6 py-3 transition-colors relative ${
                activeView === item.id 
                  ? "bg-indigo-800 text-white border-r-4 border-indigo-400" 
                  : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="ml-4 text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-700 py-2 rounded text-sm transition"
          >
            <FaSignOutAlt /> {isSidebarOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-indigo-600">
            <FaBars className="text-xl" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">Verification Officer</p>
              <p className="text-xs text-green-600 font-medium">● System Online</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-indigo-100 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Officer" alt="Admin" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEW AREA */}
        <main className="flex-1 overflow-y-auto p-2 md:p-6 bg-gray-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENT: DASHBOARD HOME (OVERVIEW)
   This fetches a summary of all stages to show a bird's-eye view.
   ========================================================================= */
function DashboardHome({ onChangeView }) {
    const { getToken } = useAuth();
    const [stats, setStats] = useState({
        pendingApps: 0,
        verifiedApps: 0,
        seatsAvailable: 0,
        physicalPending: 0,
        admitted: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock API call - Replace with real endpoint: /api/dashboard/stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // const token = await getToken();
                // const res = await axios.get(..., { headers... });
                // setStats(res.data);
                
                // MOCK DATA FOR DEMO
                setTimeout(() => {
                    setStats({
                        pendingApps: 45,
                        verifiedApps: 120,
                        seatsAvailable: 34,
                        physicalPending: 12,
                        admitted: 89
                    });
                    setLoading(false);
                }, 800);
            } catch (e) { console.error(e); }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Real-time admission cycle statistics</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget 
                    title="Online Pending" 
                    count={stats.pendingApps} 
                    color="bg-blue-500" 
                    icon={<FaClipboardCheck />}
                    onClick={() => onChangeView("VERIFY")}
                />
                <StatWidget 
                    title="Verified & Ready" 
                    count={stats.verifiedApps} 
                    color="bg-indigo-500" 
                    icon={<FaTrophy />}
                    onClick={() => onChangeView("MERIT")}
                />
                <StatWidget 
                    title="Physical Check" 
                    count={stats.physicalPending} 
                    color="bg-orange-500" 
                    icon={<FaUserCheck />}
                    onClick={() => onChangeView("PHYSICAL")}
                />
                <StatWidget 
                    title="Total Admitted" 
                    count={stats.admitted} 
                    color="bg-green-600" 
                    icon={<FaUserGraduate />}
                    onClick={() => onChangeView("FINAL")}
                />
            </div>

            {/* PROCESS FLOW VISUALIZATION */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6">Current Admission Cycle Status</h3>
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                    
                    <div className="grid grid-cols-5 gap-4 relative z-10">
                        <StepBox number="1" title="Verification" status="Completed" color="bg-green-100 text-green-700 border-green-300" />
                        <StepBox number="2" title="Merit List" status="Generated" color="bg-green-100 text-green-700 border-green-300" />
                        <StepBox number="3" title="Allocation" status="Round 1 Done" color="bg-blue-100 text-blue-700 border-blue-300" />
                        <StepBox number="4" title="Reporting" status="In Progress" color="bg-orange-100 text-orange-700 border-orange-300 animate-pulse" />
                        <StepBox number="5" title="Admission" status="Pending" color="bg-gray-100 text-gray-400 border-gray-200" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Quick Actions or Notifications can go here */}
                 <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                    <p className="opacity-90 text-sm mb-4">
                        If you face issues with document verification or merit generation, contact the System Administrator immediately.
                    </p>
                    <button className="bg-white text-indigo-700 px-4 py-2 rounded font-bold text-sm hover:bg-indigo-50 transition">
                        Contact Admin
                    </button>
                 </div>
            </div>
        </div>
    );
}

function StatWidget({ title, count, color, icon, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2 group-hover:text-indigo-600 transition-colors">
                        {count}
                    </h3>
                </div>
                <div className={`w-12 h-12 rounded-lg ${color} text-white flex items-center justify-center text-xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StepBox({ number, title, status, color }) {
    return (
        <div className={`flex flex-col items-center text-center p-4 rounded-lg border-2 ${color} bg-opacity-50`}>
            <span className="font-bold text-lg mb-1">{number}</span>
            <span className="font-bold text-sm mb-1">{title}</span>
            <span className="text-xs uppercase opacity-80">{status}</span>
        </div>
    );
}