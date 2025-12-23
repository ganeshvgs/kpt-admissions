import { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  User, MapPin, BookOpen, Layers, CheckCircle, AlertCircle, Camera 
} from "lucide-react"; 

// --- CONFIGURATION ---

const BRANCHES = [
  { code: "CE", label: "Civil Engineering" },
  { code: "ME", label: "Mechanical Engineering" },
  { code: "EEE", label: "Electrical & Electronics Engineering (EEE)" },
  { code: "ECE", label: "Electronics & Communication Engineering (ECE)" },
  { code: "CSE", label: "Computer Science & Engineering (CSE)" },
  { code: "AE", label: "Automobile Engineering (AE)" },
  { code: "ChE", label: "Chemical Engineering (ChE)" },
  { code: "Poly", label: "Polymer Technology (Poly)" }
];

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Other"];

const EMPTY_FORM = {
  admissionType: "NORMAL",
  personalDetails: {
    name: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    religion: "",
    caste: "",
    nationality: "INDIAN",
    aadharNumber: "",
    satsNumber: "",
    address: "",
    district: "",
    state: "Karnataka",
    pincode: "",
    mobile: "",
    email: "",
    photo: "", 
  },
  academicDetails: {
    board: "SSLC",
    sslcRegisterNumber: "",
    sslcPassingYear: "",
    sslcMaxMarks: "",
    sslcObtainedMarks: "",
    sslcPercentage: "",
    scienceMarks: "",
    mathsMarks: "",
    qualifyingExam: "",
    itiPucRegisterNumber: "",
    itiPucPassingYear: "",
    itiPucMaxMarks: "",
    itiPucObtainedMarks: "",
    itiPucPercentage: "",
  },
  categoryDetails: {
    category: "GM",
    casteName: "",
    annualIncome: "",
    isRural: false,
    isKannadaMedium: false,
    isStudyCertificateExempt: false,
  },
  branchPreferences: [],
};

// --- HELPER COMPONENTS ---

const InputGroup = ({ label, value, onChange, type = "text", placeholder, required = false, disabled = false, className = "" }) => (
  <div className={`flex flex-col group ${className}`}>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-blue-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      disabled={disabled}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded p-2.5 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
    />
  </div>
);

const SelectGroup = ({ label, value, onChange, options, disabled = false, placeholder = "Select" }) => (
  <div className="flex flex-col group">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within:text-blue-700">
      {label}
    </label>
    <select
      disabled={disabled}
      value={value || ""}
      onChange={onChange}
      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded p-2.5 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-6 mt-8 pb-2 border-b-2 border-slate-100">
    <div className="bg-blue-100 p-1.5 rounded-md">
      {Icon && <Icon className="w-5 h-5 text-blue-700" />}
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
  </div>
);

// --- MAIN COMPONENT ---

export default function ApplicationForm() {
  const { getToken } = useAuth();
  const { user } = useUser(); // Used to auto-fill email if empty
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("DRAFT");
  const [remarks, setRemarks] = useState("");
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Image handling
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = await getToken();
        // IMPORTANT: Assumes VITE_API_URL includes "/api" (e.g., http://localhost:5000/api)
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/applications/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.application) {
          const app = res.data.application;
          // Merge with empty form to ensure all fields exist (prevents undefined errors)
          const mergedForm = {
            ...EMPTY_FORM,
            ...app,
            personalDetails: { ...EMPTY_FORM.personalDetails, ...app.personalDetails },
            academicDetails: { ...EMPTY_FORM.academicDetails, ...app.academicDetails },
            categoryDetails: { ...EMPTY_FORM.categoryDetails, ...app.categoryDetails },
          };
          
          setForm(mergedForm);
          
          if (app.personalDetails?.photo) {
            setPreviewUrl(app.personalDetails.photo);
            setImageError(false);
          }
          
          setStatus(app.status);
          setRemarks(app.remarks || "");
          setEditable(app.status === "DRAFT" || app.status === "CORRECTION_REQUIRED");
        } else {
          // New User - Auto fill email/name from Clerk if available
          const initialForm = { ...EMPTY_FORM };
          if(user) {
             initialForm.personalDetails.email = user.primaryEmailAddress?.emailAddress || "";
             initialForm.personalDetails.name = user.fullName || "";
          }
          setForm(initialForm);
          setEditable(true);
        }
      } catch (error) {
        console.error("Fetch error", error);
        setForm(EMPTY_FORM); 
      } finally {
        setLoading(false);
      }
    };

    if(user) fetchApplication();
  }, [getToken, user]);

  // --- HANDLERS ---
  const update = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateRoot = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCheck = (section, field) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: !prev[section][field] },
    }));
  };

  const toggleBranch = (branchCode) => {
    if (!editable) return;
    setForm((prev) => ({
      ...prev,
      branchPreferences: prev.branchPreferences.includes(branchCode)
        ? prev.branchPreferences.filter((b) => b !== branchCode)
        : [...prev.branchPreferences, branchCode],
    }));
  };

  const handleMarksChange = (section, type, field, value) => {
     const updatedSection = { ...form[section], [field]: value };
     
     // Determine matching fields based on what was changed
     let obtField, maxField, targetPerc;
     
     if(field.includes('Obtained')) {
       obtField = field;
       maxField = field.replace('Obtained', 'Max');
     } else {
       maxField = field;
       obtField = field.replace('Max', 'Obtained');
     }

     targetPerc = type === 'sslc' ? 'sslcPercentage' : 'itiPucPercentage';
     
     const obt = parseFloat(field === obtField ? value : updatedSection[obtField]);
     const max = parseFloat(field === maxField ? value : updatedSection[maxField]);
     
     if (obt && max && max > 0) {
       updatedSection[targetPerc] = ((obt / max) * 100).toFixed(2);
     } else {
       updatedSection[targetPerc] = "";
     }

     setForm((prev) => ({ ...prev, [section]: updatedSection }));
  };
  
  // --- IMAGE UPLOAD ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview before upload
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setImageError(false);
    setUploadingImg(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file); // Changed "photo" to "image" to match backend 'uploadSingleImage'

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/image`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend returns { url: "cloudinary_url" }
      update("personalDetails", "photo", res.data.url);
      toast.success("Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed. Please try again.");
      setPreviewUrl(""); // Reset if failed
    } finally {
      setUploadingImg(false);
      // Clear input so same file can be selected again if needed
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  

  // --- SUBMIT ---
  const submit = async () => {
    if (!form.personalDetails.name || !form.personalDetails.mobile) {
      toast.error("Please fill Name and Mobile Number");
      return;
    }
    if (!form.personalDetails.photo) {
      toast.error("Please upload your photo before submitting");
      return;
    }
    if (form.branchPreferences.length === 0) {
      toast.error("Please select at least one branch preference");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      // If status is CORRECTION_REQUIRED, use PUT, otherwise POST for initial creation
      const method = (status === "CORRECTION_REQUIRED" || status === "DRAFT" && form._id) ? axios.put : axios.post;
      
      await method(`${import.meta.env.VITE_API_URL}/applications`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Application Submitted Successfully!");
      setStatus("SUBMITTED");
      setEditable(false);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Submission Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200">
        
        {/* TOP HEADER BAND */}
        <div className="bg-blue-900 p-6 text-white border-b-4 border-yellow-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl shadow-lg">
              K
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">KPT Mangalore</h1>
              <p className="text-blue-200 text-sm md:text-base">Govt. Polytechnic (Autonomous) | 2025-26 Admissions</p>
            </div>
          </div>
          <div className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${
            status === "SUBMITTED" ? "bg-green-500 text-white" : 
            status === "CORRECTION_REQUIRED" ? "bg-red-500 text-white" : "bg-white text-blue-900"
          }`}>
            Status: {status.replace("_", " ")}
          </div>
        </div>

        {/* REMARKS ALERT */}
        {remarks && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 mb-0 text-red-800 flex items-start gap-3 rounded-r">
            <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm uppercase">Correction Required</p>
              <p className="text-sm">{remarks}</p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-10">
          
          {/* 1. ADMISSION TYPE SELECTOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {["NORMAL", "LATERAL"].map((type) => (
              <button 
                key={type}
                onClick={() => editable && updateRoot("admissionType", type)}
                disabled={!editable}
                className={`relative p-5 rounded-lg border-2 text-left transition-all duration-200 group ${
                  form.admissionType === type 
                    ? "border-blue-600 bg-blue-50 shadow-md" 
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-bold text-lg ${form.admissionType === type ? "text-blue-800" : "text-slate-600"}`}>
                      {type === "NORMAL" ? "First Year Admission" : "Lateral Entry"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-semibold">
                      {type === "NORMAL" ? "Regular (3 Years)" : "Direct 2nd Year (2 Years)"}
                    </p>
                  </div>
                  {form.admissionType === type && <CheckCircle className="w-6 h-6 text-blue-600" />}
                </div>
              </button>
            ))}
          </div>

          {/* 2. PERSONAL DETAILS */}
          <SectionHeader icon={User} title="Personal Details" />
          
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* PHOTO UPLOAD */}
            <div className="w-full lg:w-56 flex-shrink-0 flex flex-col items-center">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Candidate Photo</p>
               <div className="w-40 h-48 bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative shadow-sm group hover:border-blue-400 transition-colors">
                 
                 {previewUrl && !imageError ? (
                   <img 
                     src={previewUrl} 
                     alt="Candidate" 
                     className="w-full h-full object-cover" 
                     onError={() => setImageError(true)}
                   />
                 ) : (
                   <div className="text-center p-4">
                     <User className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                     <span className="text-[10px] text-slate-400 uppercase font-bold">No Image</span>
                   </div>
                 )}

                 {uploadingImg && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   </div>
                 )}
               </div>

               {editable && (
                 <label className="mt-3 w-40 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded shadow-sm cursor-pointer transition-transform active:scale-95">
                   <Camera className="w-4 h-4" />
                   {previewUrl ? "Change Photo" : "Upload Photo"}
                   <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                   />
                 </label>
               )}
            </div>

            {/* PERSONAL INPUTS */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Candidate Name" value={form.personalDetails.name} onChange={(e) => update("personalDetails", "name", e.target.value)} required disabled={!editable} className="md:col-span-2" />
              
              <InputGroup label="SATS Number" value={form.personalDetails.satsNumber} onChange={(e) => update("personalDetails", "satsNumber", e.target.value)} disabled={!editable} />
              <InputGroup label="Aadhar Number" value={form.personalDetails.aadharNumber} onChange={(e) => update("personalDetails", "aadharNumber", e.target.value)} placeholder="12 Digit Number" disabled={!editable} />

              <InputGroup label="Father's Name" value={form.personalDetails.fatherName} onChange={(e) => update("personalDetails", "fatherName", e.target.value)} disabled={!editable} />
              <InputGroup label="Mother's Name" value={form.personalDetails.motherName} onChange={(e) => update("personalDetails", "motherName", e.target.value)} disabled={!editable} />
              
              <InputGroup label="Date of Birth" type="date" value={form.personalDetails.dob} onChange={(e) => update("personalDetails", "dob", e.target.value)} disabled={!editable} />
              
              <SelectGroup 
                label="Gender" 
                value={form.personalDetails.gender} 
                onChange={(e) => update("personalDetails", "gender", e.target.value)} 
                options={["Male", "Female", "Transgender"]} 
                disabled={!editable} 
              />
              
              <SelectGroup 
                label="Religion" 
                value={form.personalDetails.religion} 
                onChange={(e) => update("personalDetails", "religion", e.target.value)} 
                options={RELIGIONS} 
                disabled={!editable} 
              />
              
              <InputGroup label="Nationality" value={form.personalDetails.nationality} onChange={(e) => update("personalDetails", "nationality", e.target.value)} disabled={!editable} />
            </div>
          </div>

          {/* 3. ADDRESS */}
          <SectionHeader icon={MapPin} title="Address & Contact" />
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <InputGroup 
                 label="Address Line" 
                 value={form.personalDetails.address} 
                 onChange={(e) => update("personalDetails", "address", e.target.value)} 
                 disabled={!editable} 
                 className="md:col-span-3"
                 placeholder="House No, Street, Landmark"
               />
               <InputGroup label="State" value={form.personalDetails.state} onChange={(e) => update("personalDetails", "state", e.target.value)} disabled={!editable} />
               <InputGroup label="District" value={form.personalDetails.district} onChange={(e) => update("personalDetails", "district", e.target.value)} disabled={!editable} />
               <InputGroup label="Pincode" value={form.personalDetails.pincode} onChange={(e) => update("personalDetails", "pincode", e.target.value)} disabled={!editable} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-200">
               <InputGroup label="Mobile Number" value={form.personalDetails.mobile} onChange={(e) => update("personalDetails", "mobile", e.target.value)} required disabled={!editable} />
               <InputGroup label="Email ID" type="email" value={form.personalDetails.email} onChange={(e) => update("personalDetails", "email", e.target.value)} disabled={!editable} />
            </div>
          </div>

          {/* 4. ACADEMIC DETAILS */}
          <SectionHeader icon={BookOpen} title="Academic Information" />
          
          {/* LATERAL ENTRY SECTION */}
          {form.admissionType === "LATERAL" && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 shadow-sm">
              <h4 className="font-bold text-blue-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4"/> Qualifying Exam (ITI / PUC)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                 <SelectGroup 
                   label="Exam Stream" 
                   value={form.academicDetails.qualifyingExam} 
                   onChange={(e) => update("academicDetails", "qualifyingExam", e.target.value)} 
                   options={["ITI (2 Years)", "PUC (Science)"]} 
                   disabled={!editable} 
                  />
                 <InputGroup label="Reg Number" value={form.academicDetails.itiPucRegisterNumber} onChange={(e) => update("academicDetails", "itiPucRegisterNumber", e.target.value)} disabled={!editable} />
                 <InputGroup label="Year of Passing" value={form.academicDetails.itiPucPassingYear} onChange={(e) => update("academicDetails", "itiPucPassingYear", e.target.value)} disabled={!editable} />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <InputGroup label="Max Marks" type="number" value={form.academicDetails.itiPucMaxMarks} onChange={(e) => handleMarksChange("academicDetails", "iti", "itiPucMaxMarks", e.target.value)} disabled={!editable} />
                <InputGroup label="Obtained" type="number" value={form.academicDetails.itiPucObtainedMarks} onChange={(e) => handleMarksChange("academicDetails", "iti", "itiPucObtainedMarks", e.target.value)} disabled={!editable} />
                <InputGroup label="Percentage" value={form.academicDetails.itiPucPercentage} disabled={true} className="bg-white" />
              </div>
            </div>
          )}

          {/* SSLC SECTION */}
          <div className="border border-slate-200 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">SSLC / 10th Standard</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
               <SelectGroup 
                 label="Board" 
                 value={form.academicDetails.board} 
                 onChange={(e) => update("academicDetails", "board", e.target.value)} 
                 options={["SSLC (Karnataka)", "CBSE", "ICSE", "Other"]} 
                 disabled={!editable} 
               />
               <InputGroup label="Register No." value={form.academicDetails.sslcRegisterNumber} onChange={(e) => update("academicDetails", "sslcRegisterNumber", e.target.value)} required disabled={!editable} />
               <InputGroup label="Passing Year" value={form.academicDetails.sslcPassingYear} onChange={(e) => update("academicDetails", "sslcPassingYear", e.target.value)} disabled={!editable} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              <InputGroup label="Total Max" type="number" value={form.academicDetails.sslcMaxMarks} onChange={(e) => handleMarksChange("academicDetails", "sslc", "sslcMaxMarks", e.target.value)} disabled={!editable} />
              <InputGroup label="Total Obtained" type="number" value={form.academicDetails.sslcObtainedMarks} onChange={(e) => handleMarksChange("academicDetails", "sslc", "sslcObtainedMarks", e.target.value)} disabled={!editable} />
              
              <InputGroup label="Percentage" value={form.academicDetails.sslcPercentage} disabled={true} className="bg-slate-50" />
              
              <InputGroup label="Science Marks" type="number" value={form.academicDetails.scienceMarks} onChange={(e) => update("academicDetails", "scienceMarks", e.target.value)} disabled={!editable} />
              <InputGroup label="Maths Marks" type="number" value={form.academicDetails.mathsMarks} onChange={(e) => update("academicDetails", "mathsMarks", e.target.value)} disabled={!editable} />
            </div>
          </div>

          {/* 5. RESERVATION */}
          <SectionHeader icon={Layers} title="Category & Reservation" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <SelectGroup 
              label="Category" 
              value={form.categoryDetails.category} 
              onChange={(e) => update("categoryDetails", "category", e.target.value)} 
              options={["GM", "SC", "ST", "Cat-1", "2A", "2B", "3A", "3B"]} 
              disabled={!editable} 
            />
            <InputGroup label="Caste Name" value={form.categoryDetails.casteName} onChange={(e) => update("categoryDetails", "casteName", e.target.value)} disabled={!editable} />
            <InputGroup label="Annual Income (₹)" type="number" value={form.categoryDetails.annualIncome} onChange={(e) => update("categoryDetails", "annualIncome", e.target.value)} disabled={!editable} />
          </div>
          
          <div className="flex flex-wrap gap-4">
             {[
               { key: "isRural", label: "Rural Quota (1st-10th Rural)" },
               { key: "isKannadaMedium", label: "Kannada Medium Quota" },
               { key: "isStudyCertificateExempt", label: "Exemption from 7-Years Study Rule" }
             ].map((item) => (
               <label key={item.key} className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                 form.categoryDetails[item.key] ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "bg-white border-slate-200 hover:bg-slate-50"
               } ${!editable && "opacity-60 cursor-not-allowed"}`}>
                 <input 
                   type="checkbox" 
                   checked={!!form.categoryDetails[item.key]} 
                   onChange={() => toggleCheck("categoryDetails", item.key)} 
                   disabled={!editable}
                   className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                 />
                 <span className="text-sm font-semibold text-slate-700">{item.label}</span>
               </label>
             ))}
          </div>

          {/* 6. BRANCH SELECTION */}
          <SectionHeader icon={Layers} title="Branch Preferences" />
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-inner">
             <div className="flex justify-between items-center mb-4">
               <p className="text-xs font-bold text-slate-500 uppercase">Select branches in order of priority</p>
               <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">
                 Selected: {form.branchPreferences.length}
               </span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {BRANCHES.map((b) => {
                 const selected = form.branchPreferences.includes(b.code);
                 const index = form.branchPreferences.indexOf(b.code) + 1;
                 
                 return (
                  <button
                    key={b.code}
                    disabled={!editable}
                    onClick={() => toggleBranch(b.code)}
                    className={`relative p-3 rounded-lg text-sm font-bold text-left transition-all border flex items-center justify-between group ${
                      selected
                        ? "bg-blue-600 text-white border-blue-700 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700"
                    } ${!editable && "opacity-60 cursor-not-allowed"}`}
                  >
                    <span>{b.label}</span>
                    {selected ? (
                      <span className="w-6 h-6 bg-white text-blue-600 text-xs font-extrabold flex items-center justify-center rounded-full shadow">
                        {index}
                      </span>
                    ) : (
                      <span className="w-6 h-6 border-2 border-slate-200 rounded-full group-hover:border-blue-300"></span>
                    )}
                  </button>
                 );
               })}
             </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col items-center">
            {editable ? (
              <>
                <p className="text-sm text-slate-500 mb-4 text-center max-w-lg">
                  I hereby declare that the entries made by me in this application form are correct to the best of my knowledge and belief.
                </p>
                <button
                  onClick={submit}
                  disabled={uploadingImg || submitting}
                  className={`w-full md:w-1/2 px-8 py-4 rounded-lg font-bold text-lg text-white shadow-xl transition-all transform active:scale-[0.98] ${
                    (uploadingImg || submitting)
                      ? "bg-slate-400 cursor-not-allowed" 
                      : "bg-blue-700 hover:bg-blue-800 hover:shadow-2xl"
                  }`}
                >
                  {uploadingImg ? "Wait, Uploading Photo..." : submitting ? "Submitting Application..." : "Submit Application Form"}
                </button>
              </>
            ) : (
              <div className="px-8 py-4 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200 flex items-center gap-3 text-lg">
                <CheckCircle className="w-6 h-6" /> 
                Application Successfully Submitted
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}