import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaChair, 
  FaUserGraduate, 
  FaCogs, 
  FaCheckCircle, 
  FaExclamationCircle 
} from "react-icons/fa";

export default function SeatAllocation() {
  const { getToken } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [round, setRound] = useState(1);
  const [matrix, setMatrix] = useState({ seats: [], stats: {} });
  const [lastResult, setLastResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch Seat Data
  const fetchMatrix = async () => {
    try {
      setFetching(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/seats/matrix`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatrix(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seat matrix");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  // Handle Allocation
  const handleAllocate = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/seats/allocate`,
        { round },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      setLastResult(res.data.details);
      setShowModal(false);
      fetchMatrix(); // Refresh stats after allocation
    } catch (err) {
      toast.error(err.response?.data?.message || "Allocation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading Seat Matrix...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaChair className="text-indigo-600" /> Seat Allocation
          </h1>
          <p className="text-gray-500 mt-1">Manage seat distribution for Round {round}</p>
        </div>
        <div className="text-right">
             <label className="text-xs font-bold text-gray-500 uppercase">Current Round</label>
             <input 
                type="number" 
                min="1" 
                max="3" 
                value={round} 
                onChange={(e) => setRound(e.target.value)}
                className="block w-20 text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-bold text-lg"
             />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Seats" 
          value={matrix.stats.totalSeats || 0} 
          icon={<FaChair />} 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          label="Available" 
          value={matrix.stats.availableSeats || 0} 
          icon={<FaCheckCircle />} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          label="Allocated" 
          value={matrix.stats.allocatedSeats || 0} 
          icon={<FaUserGraduate />} 
          color="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          label="Eligible Students" 
          value={matrix.stats.eligibleStudents || 0} 
          sub="Status: MERIT_GENERATED"
          icon={<FaCogs />} 
          color="bg-yellow-100 text-yellow-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: SEAT MATRIX VISUALIZER */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-700 text-lg">Live Seat Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matrix.seats.map((seat) => (
                    <BranchCard key={seat._id} seat={seat} />
                ))}
            </div>
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <div className="space-y-6">
            
            {/* Action Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                <h3 className="font-bold text-gray-800 mb-2">Run Algorithm</h3>
                <p className="text-sm text-gray-500 mb-6">
                    This will iterate through all {matrix.stats.eligibleStudents} eligible students and assign seats based on rank and preference.
                </p>
                
                <button
                    onClick={() => setShowModal(true)}
                    disabled={matrix.stats.eligibleStudents === 0}
                    className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 ${
                        matrix.stats.eligibleStudents === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    <FaCogs /> {loading ? "Processing..." : "Run Seat Allocation"}
                </button>
                
                {matrix.stats.eligibleStudents === 0 && (
                    <p className="text-xs text-center text-red-500 mt-2">
                        No students waiting (Generate Merit List first)
                    </p>
                )}
            </div>

            {/* Last Result Summary */}
            {lastResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                        <FaCheckCircle /> Allocation Success
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-green-700">Processed:</span>
                            <span className="font-bold">{lastResult.processed}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Allocated:</span>
                            <span className="font-bold">{lastResult.allocated}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Unallocated:</span>
                            <span className="font-bold">{lastResult.unallocated}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-4 mb-4 text-indigo-600">
                    <FaExclamationCircle className="text-3xl" />
                    <h3 className="text-xl font-bold text-gray-900">Confirm Allocation</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    You are about to allocate seats for <b>Round {round}</b>.<br/>
                    This will update the status of {matrix.stats.eligibleStudents} students.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAllocate}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
                    >
                        Yes, Allocate
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

/* ================= HELPERS ================= */

function StatCard({ label, value, icon, sub, color }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function BranchCard({ seat }) {
    const percentage = Math.round(((seat.totalSeats - seat.availableSeats) / seat.totalSeats) * 100) || 0;
    
    // Determine status color
    let statusColor = "bg-green-500";
    if (percentage > 80) statusColor = "bg-yellow-500";
    if (percentage === 100) statusColor = "bg-red-500";

    return (
        <div className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{seat.branch}</h4>
                    <p className="text-xs text-gray-500">Engineering</p>
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-bold text-indigo-600">{seat.availableSeats}</span>
                    <span className="text-xs text-gray-400">Available</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div 
                    className={`h-2 rounded-full ${statusColor}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage}% Occupied</span>
                <span>Total: {seat.totalSeats}</span>
            </div>
        </div>
    );
}