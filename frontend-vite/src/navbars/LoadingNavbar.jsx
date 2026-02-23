import { motion } from "framer-motion";
import KPTLogo from "../assets/kpt-logo.png";

export default function LoadingNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* LEFT – LOGO */}
        <div className="flex items-center gap-3">

          <motion.img
            src={KPTLogo}
            alt="logo"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-9 h-9 object-contain"
          />

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-4 w-32 bg-indigo-200 rounded"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="hidden sm:block h-4 w-20 bg-indigo-100 rounded"
          />

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-8 h-8 bg-indigo-200 rounded-full"
          />

        </div>

      </div>
    </nav>
  );
}