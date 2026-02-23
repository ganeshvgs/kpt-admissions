import React, { useState, useEffect } from "react";

export default function VerifyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedApp, setSelectedApp] = useState(null);

  const [verifyStatus, setVerifyStatus] = useState("");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch applications (Placeholder for actual API call)
  useEffect(() => {
    fetchApplications();
  }, [debouncedSearch, activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/applications?status=${activeTab}&search=${debouncedSearch}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verifyStatus === "CORRECTION_REQUIRED" && !verifyRemarks.trim()) {
      alert("Remarks are required for Correction Required status.");
      return;
    }

    setActionLoading(true);
    
    // Optimistic UI Update
    const previousApps = [...applications];
    const updatedAppIndex = applications.findIndex((app) => app._id === selectedApp._id);
    
    if (updatedAppIndex > -1) {
      const updatedApps = [...applications];
      updatedApps[updatedAppIndex] = {
        ...updatedApps[updatedAppIndex],
        status: verifyStatus,
        remarks: verifyRemarks,
        verification: {
          ...updatedApps[updatedAppIndex].verification,
          verifiedBy: "Current User", // Replace with actual user context
          verifiedAt: new Date().toISOString(),
          remarks: verifyRemarks
        }
      };
      setApplications(updatedApps);
      setSelectedApp(updatedApps[updatedAppIndex]);
    }

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/applications/${selectedApp._id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: verifyStatus, remarks: verifyRemarks }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }
      
      // Close modal/details on success if it's no longer in the active tab
      if (verifyStatus !== activeTab && activeTab !== "ALL") {
        setSelectedApp(null);
        setApplications((prev) => prev.filter((app) => app._id !== selectedApp._id));
      }
    } catch (error) {
      console.error(error);
      // Revert optimistic update on failure
      setApplications(previousApps);
      alert("Failed to verify application. Please try again.");
    } finally {
      setActionLoading(false);
      setVerifyRemarks("");
      setVerifyStatus("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";
    return status.replace(/_/g, " ");
  };

  const tabs = ["PENDING", "VERIFIED", "CORRECTION_REQUIRED", "REJECTED", "ALL"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Verify Applications</h1>
          <input
            type="text"
            placeholder="Search by name, aadhar, or register number..."
            className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedApp(null);
              }}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {formatStatus(tab)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                No applications found.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  onClick={() => {
                    setSelectedApp(app);
                    setVerifyStatus(app.status || "");
                    setVerifyRemarks(app.remarks || "");
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                    selectedApp?._id === app._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {app?.personalDetails?.name || "Unknown"}
                    </h3>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {formatStatus(app?.status)}
                    </span>
                    {app?.admissionType && (
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                        {app.admissionType}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Mobile: {app?.personalDetails?.mobile || "N/A"}</p>
                    <p>SSLC Reg: {app?.academicDetails?.sslcRegisterNumber || "N/A"}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Application Details Panel */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
                {/* Header info */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    {selectedApp?.personalDetails?.photo ? (
                      <img
                        src={selectedApp.personalDetails.photo}
                        alt="Applicant"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                        {selectedApp?.personalDetails?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedApp?.personalDetails?.name || "N/A"}
                      </h2>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          Status: {formatStatus(selectedApp?.status)}
                        </span>
                        {selectedApp?.admissionType && (
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                            Type: {selectedApp.admissionType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Father's Name:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.personalDetails?.fatherName || "N/A"}</span>
                      
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedApp?.personalDetails?.dob)}</span>
                      
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.personalDetails?.gender || "N/A"}</span>
                      
                      <span className="text-gray-500">Mobile:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.personalDetails?.mobile || "N/A"}</span>
                      
                      <span className="text-gray-500">Aadhar:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.personalDetails?.aadharNumber || "N/A"}</span>
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">SSLC Reg No:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.academicDetails?.sslcRegisterNumber || "N/A"}</span>
                      
                      <span className="text-gray-500">Passing Year:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.academicDetails?.sslcPassingYear || "N/A"}</span>
                      
                      <span className="text-gray-500">SSLC Percentage:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.academicDetails?.sslcPercentage ? `${selectedApp.academicDetails.sslcPercentage}%` : "N/A"}</span>
                      
                      <span className="text-gray-500">Science Marks:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.academicDetails?.sslcScienceMarks ?? "N/A"}</span>
                      
                      <span className="text-gray-500">Maths Marks:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.academicDetails?.sslcMathsMarks ?? "N/A"}</span>
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Category Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.categoryDetails?.category || "N/A"}</span>
                      
                      <span className="text-gray-500">Caste Name:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.categoryDetails?.casteName || "N/A"}</span>
                      
                      <span className="text-gray-500">Annual Income:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.categoryDetails?.annualIncome ? `₹${selectedApp.categoryDetails.annualIncome}` : "N/A"}</span>
                      
                      <span className="text-gray-500">Rural:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.categoryDetails?.isRural ? "Yes" : "No"}</span>
                      
                      <span className="text-gray-500">Kannada Medium:</span>
                      <span className="font-medium text-gray-900">{selectedApp?.categoryDetails?.isKannadaMedium ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  {/* Branch Preferences */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Branch Preferences</h3>
                    <div className="text-sm">
                      {selectedApp?.branchPreferences?.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-1 font-medium text-gray-900">
                          {selectedApp.branchPreferences.map((pref, idx) => (
                            <li key={idx}>{pref}</li>
                          ))}
                        </ol>
                      ) : (
                        <span className="text-gray-500 italic">No preferences</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents & Verification Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Documents Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Documents</h3>
                    <div className="flex flex-col gap-2 text-sm">
                      {["sslcMarksCard", "aadhaarCard", "casteCertificate", "incomeCertificate", "ruralCertificate", "kannadaCertificate"].map((docKey) => (
                        <div key={docKey} className="flex justify-between items-center">
                          <span className="text-gray-600 capitalize">{docKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {selectedApp?.documents?.[docKey] ? (
                            <a 
                              href={selectedApp.documents[docKey]} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              View Document
                            </a>
                          ) : (
                            <span className="text-red-500 text-xs font-medium">Missing</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification Info Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Verification Info</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Online Verification</span>
                        <p className="font-medium text-gray-900">
                          Verified By: {selectedApp?.verification?.verifiedBy || "Pending"}
                        </p>
                        <p className="font-medium text-gray-900">
                          Date: {selectedApp?.verification?.verifiedAt ? formatDate(selectedApp.verification.verifiedAt) : "N/A"}
                        </p>
                        <p className="font-medium text-gray-900 mt-1">
                          Remarks: <span className="font-normal">{selectedApp?.verification?.remarks || "None"}</span>
                        </p>
                      </div>

                      {selectedApp?.physicalVerification && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Physical Verification</span>
                          <p className="font-medium text-gray-900">
                            Status: {selectedApp.physicalVerification.verified ? <span className="text-green-600">Verified</span> : <span className="text-yellow-600">Pending</span>}
                          </p>
                          <p className="font-medium text-gray-900">
                            Verified By: {selectedApp.physicalVerification.verifiedBy || "N/A"}
                          </p>
                          <p className="font-medium text-gray-900">
                            Date: {selectedApp.physicalVerification.verifiedAt ? formatDate(selectedApp.physicalVerification.verifiedAt) : "N/A"}
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
                            Remarks: <span className="font-normal">{selectedApp.physicalVerification.remarks || "None"}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Action Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Action</h3>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="VERIFIED"
                          checked={verifyStatus === "VERIFIED"}
                          onChange={(e) => setVerifyStatus(e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="font-medium text-gray-700">Verified</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="CORRECTION_REQUIRED"
                          checked={verifyStatus === "CORRECTION_REQUIRED"}
                          onChange={(e) => setVerifyStatus(e.target.value)}
                          className="w-4 h-4 text-yellow-600"
                        />
                        <span className="font-medium text-gray-700">Correction Required</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="REJECTED"
                          checked={verifyStatus === "REJECTED"}
                          onChange={(e) => setVerifyStatus(e.target.value)}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="font-medium text-gray-700">Rejected</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks {verifyStatus === "CORRECTION_REQUIRED" && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        rows="3"
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Add verification remarks..."
                        value={verifyRemarks}
                        onChange={(e) => setVerifyRemarks(e.target.value)}
                        required={verifyStatus === "CORRECTION_REQUIRED"}
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="submit"
                        disabled={actionLoading || !verifyStatus || selectedApp?.status === "VERIFIED"}
                        className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                          actionLoading || !verifyStatus || selectedApp?.status === "VERIFIED"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {actionLoading ? "Updating..." : selectedApp?.status === "VERIFIED" ? "Already Verified" : "Submit Verification"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-lg font-medium">Select an application to view details</p>
                <p className="text-sm mt-1">Click on any card from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}