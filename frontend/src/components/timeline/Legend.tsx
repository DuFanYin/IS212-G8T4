export function Legend() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs text-gray-700">Completed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-xs text-gray-700">Ongoing</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-xs text-gray-700">Under Review</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-xs text-gray-700">Overdue</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span className="text-xs text-gray-700">Unassigned</span>
      </div>
    </div>
  );
}


