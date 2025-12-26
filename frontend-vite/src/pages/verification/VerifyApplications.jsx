import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSync } from "react-icons/fa"; // Import Icon

// Define Tab Categories
const TABS = [
  { id: "SUBMITTED", label: "Pending" },
  { id: "VERIFIED", label: "Verified" },
  { id: "CORRECTION_REQUIRED", label: "Corrections" },
  { id: "REJECTED", label: "Rejected" },
];

export default function VerifyApplications() {
  const { getToken } = useAuth();
  
  // State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SUBMITTED"); // Default to Pending
  const [searchTerm, setSearchTerm] = useState("");
  const [remarksMap, setRemarksMap] = useState({});
  const [openId, setOpenId] = useState(null);

  // Debounce helper for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeTab]); // Re-fetch when search or tab changes

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/verification/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: activeTab, // 👈 Send active tab status
            search: searchTerm, // 👈 Send search query
          },
        }
      );
      setApplications(res.data.applications);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken();

      if (status === "CORRECTION_REQUIRED" && !remarksMap[id]) {
        toast.error("Remarks are required for correction");
        return;
      }

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/verification/applications/${id}`,
        { status, remarks: remarksMap[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Application updated to ${status}`);
      
      // Remove the item from the current list (UI Optimistic Update)
      setApplications((prev) => prev.filter((app) => app._id !== id));
      
      setRemarksMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
      setOpenId(null);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Application Verification</h2>
            <p className="text-gray-500 text-sm">Manage student applications and status</p>
        </div>
        
        {/* SEARCH BAR & REFRESH BUTTON */}
        <div className="w-full md:w-auto flex gap-2 items-center">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by Name, Mobile or SSLC Reg No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {searchTerm && (
               <button 
                 onClick={() => setSearchTerm("")}
                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
            )}
          </div>

          {/* REFRESH BUTTON */}
          <button 
            onClick={fetchApplications}
            className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm"
            title="Refresh List"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
                setActiveTab(tab.id);
                setOpenId(null); // Close any open details
            }}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading applications...</div>
      ) : (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No {activeTab.toLowerCase().replace('_', ' ')} applications found.</p>
            </div>
          ) : (
            applications.map((app) => (
              <ApplicationCard
                key={app._id}
                app={app}
                openId={openId}
                setOpenId={setOpenId}
                remarksMap={remarksMap}
                setRemarksMap={setRemarksMap}
                updateStatus={updateStatus}
                currentTab={activeTab}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT: CARD ================= */
function ApplicationCard({ app, openId, setOpenId, remarksMap, setRemarksMap, updateStatus, currentTab }) {
  const isOpen = openId === app._id;

  // Determine badge color based on status
  const getStatusBadge = (status) => {
      switch(status) {
          case 'VERIFIED': return 'bg-green-100 text-green-700';
          case 'REJECTED': return 'bg-red-100 text-red-700';
          case 'CORRECTION_REQUIRED': return 'bg-yellow-100 text-yellow-700';
          default: return 'bg-blue-100 text-blue-700';
      }
  };

  return (
    <div className={`border rounded-lg bg-white shadow-sm transition-all ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : 'hover:border-indigo-300'}`}>
      
      {/* HEADER (Always Visible) */}
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setOpenId(isOpen ? null : app._id)}>
        {/* Photo Thumbnail */}
        <div className="w-12 h-12 md:w-16 md:h-16 border rounded bg-gray-100 flex-shrink-0 overflow-hidden">
          {app.personalDetails?.photo ? (
            <img src={app.personalDetails.photo} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">N/A</div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{app.personalDetails?.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(app.status)}`}>
                  {app.status.replace('_', ' ')}
              </span>
          </div>
          <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
              <span>SSLC: <span className="text-gray-700 font-medium">{app.academicDetails?.sslcPercentage || '-'}%</span></span>
              <span>•</span>
              <span>Cat: <span className="text-gray-700 font-medium">{app.categoryDetails?.category}</span></span>
              <span>•</span>
              <span>Mobile: {app.personalDetails?.mobile}</span>
          </div>
        </div>

        {/* Toggle Button */}
        <button className="hidden md:block text-indigo-600 text-sm font-medium hover:underline">
          {isOpen ? "Close" : "Review"}
        </button>
      </div>

      {/* EXPANDED DETAILS */}
      {isOpen && (
        <div className="border-t bg-gray-50 p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Data Display */}
            <div className="space-y-6">
                <Section title="Personal Information">
                    <Info label="Full Name" value={app.personalDetails?.name} />
                    <Info label="Father's Name" value={app.personalDetails?.fatherName} />
                    <Info label="Gender" value={app.personalDetails?.gender} />
                    <Info label="DOB" value={app.personalDetails?.dob} />
                    <Info label="Aadhar" value={app.personalDetails?.aadharNumber} />
                </Section>

                <Section title="Academic Details">
                    <Info label="SSLC Reg No" value={app.academicDetails?.sslcRegisterNumber} />
                    <Info label="Passing Year" value={app.academicDetails?.sslcPassingYear} />
                    <Info label="SSLC Percentage" value={`${app.academicDetails?.sslcPercentage}%`} />
                    <Info label="Science Marks" value={app.academicDetails?.scienceMarks} />
                    <Info label="Maths Marks" value={app.academicDetails?.mathsMarks} />
                </Section>

                <Section title="Branch Preferences">
                    <div className="flex flex-wrap gap-2 mt-1">
                        {app.branchPreferences.map((b, i) => (
                            <span key={b} className="px-2 py-1 bg-white border rounded text-xs text-gray-700 font-medium">
                                {i+1}. {b}
                            </span>
                        ))}
                    </div>
                </Section>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
                <Section title="Category & Reservation">
                    <Info label="Category" value={app.categoryDetails?.category} />
                    <Info label="Caste" value={app.categoryDetails?.casteName} />
                    <Info label="Income" value={app.categoryDetails?.annualIncome} />
                    <div className="flex gap-2 mt-2">
                        {app.categoryDetails?.isRural && <Badge>Rural</Badge>}
                        {app.categoryDetails?.isKannadaMedium && <Badge>Kannada Medium</Badge>}
                    </div>
                </Section>

                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Verification Action</h4>
                    
                    <label className="block text-sm text-gray-600 mb-1">Remarks (for rejection/correction)</label>
                    <textarea 
                        value={remarksMap[app._id] || app.remarks || ""}
                        onChange={(e) => setRemarksMap(prev => ({ ...prev, [app._id]: e.target.value }))}
                        className="w-full border rounded p-2 text-sm mb-4 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Enter comments here..."
                    />

                    <div className="flex flex-wrap gap-3">
                        {/* Logic: If already verified, disable Verify button unless you want to allow re-verify */}
                        
                        <ActionButton 
                            onClick={() => updateStatus(app._id, "VERIFIED")} 
                            color="bg-green-600 hover:bg-green-700"
                            disabled={currentTab === 'VERIFIED'}
                        >
                            {currentTab === 'VERIFIED' ? 'Already Verified' : 'Approve & Verify'}
                        </ActionButton>

                        <ActionButton 
                            onClick={() => updateStatus(app._id, "CORRECTION_REQUIRED")} 
                            color="bg-yellow-500 hover:bg-yellow-600"
                        >
                            Request Correction
                        </ActionButton>

                        <ActionButton 
                            onClick={() => updateStatus(app._id, "REJECTED")} 
                            color="bg-red-600 hover:bg-red-700"
                            disabled={currentTab === 'REJECTED'}
                        >
                             {currentTab === 'REJECTED' ? 'Already Rejected' : 'Reject Application'}
                        </ActionButton>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */
function Section({ title, children }) {
    return (
        <div className="pb-4 border-b border-gray-100 last:border-0">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
            <div className="grid grid-cols-1 gap-y-1">
                {children}
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}:</span>
            <span className="font-medium text-gray-900">{value || "-"}</span>
        </div>
    );
}

function Badge({ children }) {
    return <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">{children}</span>;
}

function ActionButton({ onClick, color, children, disabled }) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`flex-1 py-2 px-4 rounded text-white font-medium text-sm transition-colors ${disabled ? 'bg-gray-300 cursor-not-allowed' : color}`}
        >
            {children}
        </button>
    );
}