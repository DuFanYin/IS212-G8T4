'use client';

interface metricProps {
  tasks: Array<{
    departmentName?: string;
    name: string | null;
    ongoing: number;
    under_review: number;
    completed: number;
    overdue: number;
  }>;
}

function getProductivityIndex(tasks) {
  const totalTasks = tasks.reduce((sum, t) => sum + t.ongoing + t.under_review + t.completed + t.overdue, 0);
  const completedTasks = tasks.reduce((sum, t) => sum + t.completed, 0);
  const overdueTasks = tasks.reduce((sum, t) => sum + t.overdue, 0);

  if (totalTasks === 0) return 0;
  return Math.max(0, ((completedTasks - overdueTasks) / totalTasks));
}

export default function ProductivityIndex({tasks}: metricProps) {
  const index = getProductivityIndex(tasks);
  const percent = Math.min(index, 1); 
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Productivity Index</h2>
      <div className="flex flex-col items-center justify-center">
        <span className="mb-2 text-base font-medium text-gray-700">{tasks[0].departmentName || "Personal"}</span>
        <svg
          className="mb-2 block mx-auto drop-shadow-lg"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
        >
          <defs>
            <linearGradient id="pi-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e42" />
            </linearGradient>
            <radialGradient id="pi-glow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#fffbe8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fffbe8" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Soft inner glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - 8}
            fill="url(#pi-glow)"
          />
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Gradient progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#pi-gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
          {/* Centered number */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-bold"
            fill="#f59e42"
            fontSize="1.1rem"
          >
            {(index * 10).toFixed(1)}/10
          </text>
        </svg>
      </div>
    </div>
  );
}