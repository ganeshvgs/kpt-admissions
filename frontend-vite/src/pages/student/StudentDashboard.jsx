import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  LayoutDashboard, FileText, Award, CheckCircle, 
  AlertTriangle, School, Clock, ChevronRight, XCircle 
} from "lucide-react";

export default function StudentDashboard() {
  const { getToken } = useAuth();

  const [application, setApplication] = useState(null);
  const [seat, setSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatLoading, setSeatLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchApplication = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/applications/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const app = res.data.application || null;
      setApplication(app);

      // If seat is allotted or accepted, fetch the seat details
      if (app?.status === "SEAT_ALLOTTED" || app?.status === "SEAT_ACCEPTED") {
        fetchSeat();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeat = async () => {
    try {
      setSeatLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/student/seat`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSeat(res.data.seat);
    } catch (err) {
      console.error("Failed to fetch seat", err);
    } finally {
      setSeatLoading(false);
    }
  };

  const respondSeat = async (response) => {
    if(!confirm(`Are you sure you want to ${response} this seat?`)) return;
    
    setActionLoading(true);
    try {
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/seat/respond`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Seat ${response.toLowerCase()} successfully!`);
      fetchApplication(); // Refresh state to show new status
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // --- PDF DOWNLOAD HANDLER (Optimized) ---
  const downloadPDF = async () => {
    try {
      const token = await getToken();
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/pdf/admission`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important: Treat response as binary
        }
      );

      // Create a Blob from the PDF Stream
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Admission_Confirmation_${application.studentClerkId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // CLEANUP: Remove element and revoke URL to free memory
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Admission Order downloaded successfully!");
    } catch (err) {
      console.error("PDF Download Error:", err);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  // --- ANIMATION STYLES (Injected) ---
  const fadeInClass = "animate-[fadeIn_0.6s_ease-out_forwards]";
  
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ======================================================
          🟢 NO APPLICATION VIEW
         ====================================================== */}
      {!application ? (
        <div className={`max-w-4xl mx-auto ${fadeInClass}`}>
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-blue-900 p-8 text-white text-center">
              <School className="w-16 h-16 mx-auto mb-4 text-blue-300" />
              <h1 className="text-3xl font-extrabold mb-2">Student Admission Portal</h1>
              <p className="text-blue-100">Welcome to the Government Polytechnic Admission System</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                
                {/* Steps Visualizer */}
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" /> Admission Roadmap
                  </h2>
                  <div className="space-y-0 relative border-l-2 border-slate-200 ml-3 pl-8 py-2">
                    {[
                      "Submit Application", 
                      "Document Verification", 
                      "Merit List & Ranking", 
                      "Seat Allotment", 
                      "Physical Reporting"
                    ].map((step, i) => (
                      <div key={i} className="mb-8 relative group">
                        <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-4 border-blue-200 group-hover:border-blue-500 transition-colors"></span>
                        <h3 className="font-bold text-slate-700">{step}</h3>
                        <p className="text-xs text-slate-500">Step {i + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="flex-1 w-full bg-blue-50 p-8 rounded-xl border border-blue-100 text-center">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">Ready to Start?</h3>
                  <p className="text-slate-600 mb-8">
                    Applications for the academic year 2025-26 are now open. 
                    Ensure you have your SSLC/PUC details ready.
                  </p>
                  <Link
                    to="/student/application"
                    className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1"
                  >
                    Fill Application Form <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================
            🟢 DASHBOARD VIEW (APP EXISTS)
           ====================================================== */
        <div className={`max-w-5xl mx-auto space-y-6 ${fadeInClass}`}>
          
          {/* 1. Header Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>
               <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <LayoutDashboard className="text-blue-600" /> My Dashboard
               </h1>
               <p className="text-slate-500 text-sm mt-1">Application ID: <span className="font-mono text-slate-700 font-bold">{application._id.slice(-6).toUpperCase()}</span></p>
             </div>
             <Link to="/student/application" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
               View Full Application <ChevronRight className="w-4 h-4" />
             </Link>
          </div>

          {/* 2. Status Banner */}
          <div className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${getStatusStyle(application.status).bg} ${getStatusStyle(application.status).border}`}>
             <div className={`p-3 rounded-full ${getStatusStyle(application.status).iconBg}`}>
               {getStatusIcon(application.status)}
             </div>
             <div>
               <h2 className={`text-lg font-bold ${getStatusStyle(application.status).text}`}>
                 {application.status.replace(/_/g, " ")}
               </h2>
               <p className="text-slate-600 mt-1 text-sm">
                 {nextStepMessage(application.status)}
               </p>
             </div>
          </div>

          {/* 3. Dynamic Cards based on Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* A. MERIT CARD */}
            {(application.status === "MERIT_GENERATED" || application.status === "SEAT_ALLOTTED" || application.status === "ADMITTED" || application.status === "SEAT_ACCEPTED") && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Award className="text-yellow-500" /> Merit Details
                  </h3>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">OFFICIAL</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">State Rank</p>
                    <p className="text-2xl font-extrabold text-slate-800">{application.rank || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Score</p>
                    <p className="text-2xl font-extrabold text-slate-800">{application.meritScore || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* B. SEAT ALLOTMENT CARD */}
            {application.status === "SEAT_ALLOTTED" && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200 relative overflow-hidden md:col-span-2">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ACTION REQUIRED
                </div>
                
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <School className="w-5 h-5" /> Seat Allotted
                </h3>

                {seatLoading ? (
                  <p className="text-slate-500 animate-pulse">Fetching seat details...</p>
                ) : seat ? (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-xs font-bold text-purple-500 uppercase mb-1">Branch Allotted</p>
                      <p className="text-xl font-bold text-slate-800">{seat.branch}</p>
                      <p className="text-sm text-slate-600 mt-1">Government Polytechnic, Mangalore</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <button
                        onClick={() => respondSeat("ACCEPTED")}
                        disabled={actionLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading ? "Processing..." : <><CheckCircle className="w-4 h-4" /> Accept Seat</>}
                      </button>
                      <button
                        onClick={() => respondSeat("REJECTED")}
                        disabled={actionLoading}
                        className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject Seat
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Error loading seat data.</p>
                )}
              </div>
            )}

            {/* C. ADMISSION CONFIRMATION */}
            {application.status === "ADMITTED" && (
               <div className="md:col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg text-center">
                 <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-100" />
                 <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                 <p className="text-green-100 text-lg">
                   Your admission process is complete.
                 </p>

                 <div className="mt-6 flex flex-col items-center gap-3">
                   <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 px-4 inline-block">
                     <p className="font-mono text-sm font-bold">Student ID: {application.studentClerkId.slice(-8)}</p>
                   </div>
                   
                   <button
                     onClick={downloadPDF}
                     className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-lg shadow hover:bg-emerald-50 transition flex items-center gap-2"
                   >
                     <FileText className="w-4 h-4" /> Download Admission Order
                   </button>
                 </div>
               </div>
            )}

          </div>

          {/* 4. Physical Verification Info */}
          {(application.status === "PHYSICAL_VERIFICATION_PENDING" || application.status === "SEAT_ACCEPTED") && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg shadow-sm">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Next Step: Physical Reporting
              </h3>
              <p className="text-blue-800 mt-2">
                Please visit the college office (Room 102) between 10:00 AM and 4:00 PM with your original documents:
              </p>
              <ul className="list-disc ml-5 mt-3 text-sm text-blue-800 space-y-1">
                <li>SSLC / PUC Marks Card (Original)</li>
                <li>Transfer Certificate (TC)</li>
                <li>Caste/Income Certificate (if applicable)</li>
                <li>Passport Size Photos (3 copies)</li>
                <li>Aadhar Card</li>
                <li>Provisional Seat Allotment Letter (if available)</li>
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/* ================= HELPERS & STYLES ================= */

function getStatusStyle(status) {
  switch (status) {
    case "SUBMITTED":
      return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", iconBg: "bg-amber-100" };
    case "VERIFIED":
      return { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", iconBg: "bg-indigo-100" };
    case "MERIT_GENERATED":
      return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", iconBg: "bg-blue-100" };
    case "SEAT_ALLOTTED":
      return { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800", iconBg: "bg-purple-100" };
    case "SEAT_ACCEPTED":
    case "PHYSICAL_VERIFICATION_PENDING":
      return { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-800", iconBg: "bg-cyan-100" };
    case "ADMITTED":
      return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", iconBg: "bg-emerald-100" };
    case "REJECTED":
      return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", iconBg: "bg-red-100" };
    default:
      return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800", iconBg: "bg-slate-200" };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "ADMITTED": return <CheckCircle className="w-6 h-6 text-emerald-600" />;
    case "REJECTED": return <AlertTriangle className="w-6 h-6 text-red-600" />;
    case "SEAT_ALLOTTED": return <School className="w-6 h-6 text-purple-600" />;
    case "MERIT_GENERATED": return <Award className="w-6 h-6 text-blue-600" />;
    default: return <FileText className="w-6 h-6 text-slate-600" />;
  }
}

function nextStepMessage(status) {
  const messages = {
    "DRAFT": "Please complete and submit your application.",
    "SUBMITTED": "Application under review by administration.",
    "CORRECTION_REQUIRED": "Update your application as per remarks.",
    "VERIFIED": "Documents verified. Waiting for Merit List.",
    "MERIT_GENERATED": "Merit List is out! Seat allotment begins shortly.",
    "SEAT_ALLOTTED": "Congratulations! A seat has been allotted. Please Accept or Reject.",
    "SEAT_ACCEPTED": "Seat accepted. Proceed to physical verification.",
    "PHYSICAL_VERIFICATION_PENDING": "Please report to college for offline document check.",
    "DOCUMENTS_VERIFIED": "Final admission approval pending.",
    "ADMITTED": "You are officially a student of KPT Mangalore!",
    "REJECTED": "Your application was rejected. Contact admin."
  };
  return messages[status] || "Check back later for updates.";
}