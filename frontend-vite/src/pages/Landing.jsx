export default function Landing() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-800">

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* LEFT CONTENT */}
        <div className="text-center md:text-left">
          <p className="text-[11px] sm:text-sm uppercase tracking-widest text-indigo-600 font-semibold">
            Autonomous Polytechnic Institution
          </p>

          <h1 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold leading-snug">
            Karnataka Polytechnic <br className="hidden sm:block" />
            Mangalore (KPT)
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
            Official online admission portal for Diploma programmes.
            Apply, verify documents, view merit status, and track
            admission progress securely.
          </p>

          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="px-3 py-2 bg-white rounded-full shadow">
              🎓 Diploma Admissions
            </span>
            <span className="px-3 py-2 bg-white rounded-full shadow">
              📍 Mangalore, Karnataka
            </span>
            <span className="px-3 py-2 bg-white rounded-full shadow">
              🏛 Autonomous Institution
            </span>
          </div>

          <p className="mt-5 text-[11px] sm:text-xs text-gray-500 italic">
            * Student, Verification Officer, HOD, and Admin login available.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center md:justify-end">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSohoo_3dE0QLEFuPAGCQQZXaCbHBiWD__74w&s"
            alt="KPT Admissions"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl shadow-xl object-cover"
          />
        </div>
      </section>

      {/* ================= ADMISSION PROCESS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h2 className="text-xl sm:text-3xl font-semibold text-center">
          Admission Process
        </h2>

        <p className="mt-3 sm:mt-4 text-center text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          A transparent and structured admission workflow designed
          for Diploma applicants under the autonomous system.
        </p>

        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Online Application",
              icon: "📝",
              desc: "Students apply by entering SSLC / PUC details and selecting preferred branches.",
            },
            {
              title: "Reservation Selection",
              icon: "🏷️",
              desc: "Choose applicable reservations like Category, Rural, Kannada Medium, HK Region.",
            },
            {
              title: "Document Verification",
              icon: "📂",
              desc: "Physical document verification at the institute on the scheduled date.",
            },
            {
              title: "Merit List Generation",
              icon: "📊",
              desc: "Merit list prepared based on eligibility and academic performance.",
            },
            {
              title: "Seat Allotment",
              icon: "🎯",
              desc: "Seats allotted department-wise and forwarded to respective HODs.",
            },
            {
              title: "Department Allocation",
              icon: "🏫",
              desc: "Final admitted students are mapped to departments and HOD dashboards.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white p-5 sm:p-6 rounded-xl shadow border hover:shadow-lg transition text-center sm:text-left"
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="mt-3 text-base sm:text-lg font-semibold text-indigo-700">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-300 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-medium text-white text-sm sm:text-base">
            Karnataka Polytechnic, Mangalore
          </p>

          <p className="mt-2 text-xs sm:text-sm">
            Autonomous Diploma Institution · Karnataka
          </p>

          <p className="mt-4 text-[11px] sm:text-xs text-slate-400">
            © {new Date().getFullYear()} KPT Admissions Portal · All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
