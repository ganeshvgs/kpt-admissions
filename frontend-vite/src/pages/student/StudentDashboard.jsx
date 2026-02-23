import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LayoutDashboard, FileText, User, Phone, CheckCircle, Download } from "lucide-react";
import FullPageLoader from "../../components/FullPageLoader";

export default function StudentDashboard() {
  const { getToken } = useAuth();

  const [application, setApplication] = useState(null);
  const [seat, setSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admission, setAdmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // New state for PDF downloads

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const setRes = await axios.get(`${import.meta.env.VITE_API_URL}/admission/settings`);
      setAdmission(setRes.data);

      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/applications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplication(res.data.application || null);

      if (res.data.application?.status === "SEAT_ALLOTTED") {
        const seatRes = await axios.get(`${import.meta.env.VITE_API_URL}/student/seat`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeat(seatRes.data.seat);
      }
    } catch {
      toast.error("Dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  const respondSeat = async (resp) => {
    if (!confirm(`Confirm ${resp}?`)) return;
    setActionLoading(true);
    try {
      const token = await getToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/student/seat/respond`, 
        { response: resp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seat updated");
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const downloadAdmissionPDF = async () => {
    setPdfLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pdf/admission`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "AdmissionOrder.pdf";
      a.click();
    } catch (error) {
      toast.error("Failed to download Admission Order");
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadAcknowledgementPDF = async () => {
    setPdfLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pdf/acknowledgement`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "ApplicationAcknowledgement.pdf";
      a.click();
    } catch (error) {
      toast.error("Failed to download Acknowledgement");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <FullPageLoader label="Loading Student Dashboard..." />;

  const showAcknowledgementStatuses = ["SUBMITTED", "VERIFIED", "MERIT_GENERATED", "SEAT_ALLOTTED", "SEAT_ACCEPTED"];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* NO APPLICATION */}
      {!application && (
        <div className="bg-white p-10 text-center rounded-xl shadow">
          <h1 className="text-2xl font-bold">Student Admission Portal</h1>
          {(admission?.normalActive || admission?.lateralActive) ? (
            <Link to="/student/application" className="mt-6 inline-block bg-blue-600 text-white px-8 py-4 rounded font-bold transition hover:bg-blue-700">
              Apply Now
            </Link>
          ) : (
            <p className="mt-6 text-red-600 font-bold">Admissions Closed</p>
          )}
        </div>
      )}

      {/* DASHBOARD */}
      {application && (
        <>
          {/* Header Section */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <LayoutDashboard className="text-blue-600" /> Dashboard
              </h2>
            </div>
            <Link to="/student/application" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <FileText size={18} /> View Application Form →
            </Link>
          </div>

          {/* Student Details Card */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">Application Details</p>
              <div className="flex items-center gap-2 text-gray-800">
                <FileText size={16} className="text-gray-400" />
                <span className="font-semibold">ID:</span> {application.applicationId || application._id.slice(-8).toUpperCase()}
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <User size={16} className="text-gray-400" />
                <span className="font-semibold">Name:</span> {application.candidateName || "Not Provided"}
              </div>
              <div className="flex items-center gap-2 text-gray-800">
                <Phone size={16} className="text-gray-400" />
                <span className="font-semibold">Mobile:</span> {application.mobile || "Not Provided"}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 font-medium">Admission Status</p>
              <div className="flex items-center gap-2 text-gray-800">
                <span className="font-semibold">Type:</span> {application.admissionType || "Regular"}
              </div>
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md inline-flex w-fit font-bold border border-blue-100">
                {application.status}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle size={14} className="text-green-500" /> {nextStepMessage(application.status)}
              </p>
            </div>
          </div>

          {/* Actions & PDF Downloads */}
          <div className="bg-slate-50 p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">Available Documents</h3>
              <p className="text-sm text-gray-500">Download your official system-generated files here.</p>
            </div>

            <div className="flex gap-3">
              {showAcknowledgementStatuses.includes(application.status) && (
                <button 
                  onClick={downloadAcknowledgementPDF} 
                  disabled={pdfLoading}
                  className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition"
                >
                  <Download size={18} />
                  {pdfLoading ? "Generating PDF..." : "Download Acknowledgement"}
                </button>
              )}

              {application.status === "ADMITTED" && (
                <button 
                  onClick={downloadAdmissionPDF} 
                  disabled={pdfLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition"
                >
                  <Download size={18} />
                  {pdfLoading ? "Generating PDF..." : "Download Admission Order"}
                </button>
              )}
            </div>
          </div>

          {/* Seat Allotment Actions */}
          {application.status === "SEAT_ALLOTTED" && seat && (
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
              <p className="font-bold text-purple-900 text-lg">Action Required: Seat Allotment</p>
              <p className="text-purple-800 mt-1">You have been allotted a seat in: <span className="font-bold">{seat.branch}</span></p>
              <div className="flex gap-4 mt-4">
                <button onClick={() => respondSeat("ACCEPT")} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">Accept Seat</button>
                <button onClick={() => respondSeat("REJECT")} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">Reject Seat</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* HELPERS */
function nextStepMessage(s) {
  return {
    "DRAFT": "Please complete your application form.",
    "SUBMITTED": "Your application is under review by officials.",
    "CORRECTION_REQUIRED": "Action needed: Fix highlighted corrections.",
    "VERIFIED": "Application verified. Waiting for merit list generation.",
    "MERIT_GENERATED": "Merit generated. Awaiting seat allotment.",
    "SEAT_ALLOTTED": "Seat allotted. Please accept or reject.",
    "SEAT_ACCEPTED": "Seat accepted. Report to the college for physical verification.",
    "PHYSICAL_VERIFICATION_PENDING": "Pending physical document verification at the college.",
    "ADMITTED": "Admission successfully completed.",
    "REJECTED": "Application has been rejected."
  }[s] || "";
}