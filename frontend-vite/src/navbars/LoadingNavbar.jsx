export default function LoadingNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center animate-pulse">
        <div className="h-8 w-28 bg-gray-200 rounded" />
        <div className="flex gap-3">
          <div className="h-4 w-16 bg-gray-200 rounded hidden sm:block" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </nav>
  );
}
