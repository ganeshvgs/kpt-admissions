import React, { useEffect, useState } from "react";
import axios from "axios";
import FullPageLoader from "../components/FullPageLoader";
export default function Landing() {

  const [status, setStatus] = useState({
    normal: false,
    lateral: false,
    loading: true,
  });

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admission/settings`);
        setStatus({
          normal: res.data.normalActive,
          lateral: res.data.lateralActive,
          loading: false,
        });
      } catch {
        setStatus({ normal: false, lateral: false, loading: false });
      }
    };
    loadStatus();
  }, []);

  const renderStatus = () => {
    if (status.loading) {
  return <FullPageLoader label="Checking admission status..." />;
}

    if (!status.normal && !status.lateral) {
      return (
        <span className="px-4 py-2 rounded-full bg-red-100 text-red-600 text-xs font-bold">
          ❌ Admissions Closed
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {status.normal && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
            NORMAL ADMISSION OPEN
          </span>
        )}

        {status.lateral && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
            LATERAL ADMISSION OPEN
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative">

      {/* Dot Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <section className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div className="space-y-6 text-center md:text-left">

          {/* LIVE STATUS */}
          {renderStatus()}

          <p className="uppercase tracking-widest text-indigo-600 font-semibold text-sm">
            Autonomous Polytechnic Institution
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold">
            Karnataka Polytechnic <br />
            <span className="text-indigo-600">Mangalore (KPT)</span>
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto md:mx-0">
            Official diploma admission portal. Apply, verify documents,
            view merit list and track admission progress securely.
          </p>

          <div className="flex gap-3 flex-wrap justify-center md:justify-start text-sm">
            <span className="px-4 py-2 bg-white rounded-full shadow">🎓 Diploma</span>
            <span className="px-4 py-2 bg-white rounded-full shadow">📍 Mangalore</span>
            <span className="px-4 py-2 bg-white rounded-full shadow">🏛 Autonomous</span>
          </div>

        </div>

        {/* IMAGE */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-indigo-400 blur-[80px] opacity-20 rounded-full"></div>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSohoo_3dE0QLEFuPAGCQQZXaCbHBiWD__74w&s"
            alt="KPT"
            className="relative z-10 max-w-md rounded-2xl shadow-xl border"
          />
        </div>

      </section>

    </div>
  );
}