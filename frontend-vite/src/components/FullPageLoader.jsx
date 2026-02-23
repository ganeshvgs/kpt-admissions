import { motion } from "framer-motion";
import KPTLogo from "../assets/kpt-logo.png"; // ← put your logo here

export default function FullPageLoader({ label = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-10 w-[320px] text-center border border-indigo-100"
      >

        {/* LOGO */}
        <motion.img
          src={KPTLogo}
          alt="KPT Logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 mx-auto mb-4 object-contain"
        />

        {/* College Name */}
        <h2 className="text-lg font-bold text-indigo-700 mb-6">
          KPT Mangalore
        </h2>

        {/* Animated Progress Bar */}
        <div className="relative h-2 w-full bg-gray-200 rounded overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded"
          />
        </div>

        {/* Status Text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-5 text-sm text-gray-500"
        >
          {label}
        </motion.p>

      </motion.div>
    </div>
  );
}