// frontend-vite/src/components/LoadOverlay.jsx

export default function LoadOverlay({ show, message = "Loading..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* Perfect Circle Container */}
      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white shadow-2xl border border-gray-200">
        
        {/* Circular Spinner */}
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />

        {/* Message */}
        <p className="mt-3 text-xs font-semibold text-gray-700 text-center px-4">
          {message}
        </p>
      </div>
    </div>
  );
}
