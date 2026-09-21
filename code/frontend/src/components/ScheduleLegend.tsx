export default function ScheduleLegend() {
  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-100">Schedule Legend</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#8b5cf6" }}></div>
          <span className="text-gray-100">Study</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ec4899" }}></div>
          <span className="text-gray-100">Work</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
          <span className="text-gray-100">Personal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
          <span className="text-gray-100">Social</span>
        </div>
      </div>
    </div>
  );
} 