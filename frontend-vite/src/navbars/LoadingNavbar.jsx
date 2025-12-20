export default function LoadingNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="px-6 py-3 flex justify-between items-center animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </nav>
  );
}
