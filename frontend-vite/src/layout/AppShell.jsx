import { motion } from "framer-motion";

export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Animated Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100 -z-20" />

      {/* Floating Blobs */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="fixed w-96 h-96 bg-indigo-300 rounded-full blur-3xl opacity-30 top-10 left-10 -z-10"
      />
      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="fixed w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 bottom-10 right-10 -z-10"
      />

      {/* PAGE FADE IN */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 mt-20">
        <div className="text-center text-sm">
          © {new Date().getFullYear()} KPT Admissions
        </div>
      </footer>
    </div>
  );
}