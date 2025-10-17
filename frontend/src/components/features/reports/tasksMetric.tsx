'use client';

import { useState } from 'react';

// Professional labels & colors
const STATUS_LABELS: Record<string, string> = {
  ongoing: 'On-going',
  under_review: 'Under Review',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: '#2563eb',      
  under_review: '#f59e42', 
  completed: '#22c55e',   
};

// Order from bottom to top (stacked)
const STACK_ORDER: Array<keyof typeof STATUS_LABELS> = [
  'ongoing',
  'under_review',
  'completed',
];

interface metricProps {
  tasks: Array<{
    name: string | null;
    ongoing: number;
    under_review: number;
    completed: number;
    overdue: number;
  }>;
}

export default function TasksMetric({ tasks }: metricProps) {
  const [hovered, setHovered] = useState<{ deptIdx: number; status: string } | null>(null);

  const rows = tasks.map(t => ({
      name: t.name ?? 'No team',
      ongoing: t.ongoing,
      under_review: t.under_review,
      completed: t.completed,
    }));
  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      <h2 className="font-semibold text-gray-800 text-lg mb-4">Task Metrics</h2>
      <div className="flex justify-center w-full">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white px-4 py-2 rounded-full shadow-md border border-slate-100 max-w-full justify-center">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span
                style={{ background: color }}
                className="w-2 h-2 rounded-full"
                aria-hidden
              />
              <span className="text-xs text-gray-700 font-medium">{STATUS_LABELS[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 flex items-end justify-center gap-8 w-full">
        {rows.map((group, groupIdx) => {
          const total = group.ongoing + group.under_review + group.completed || 1;
          return (
            <div key={group.name} className="flex flex-col items-center">
              <span className="mb-2 text-base font-semibold">{group.name}</span>

              {/* Stacked vertical bar */}
              <div className="relative flex flex-col-reverse h-36 w-10 rounded-lg bg-white border border-blue-100 shadow-md">
                {STACK_ORDER.map((status) => {
                  const value = group[status as keyof typeof group] as number;
                  const pct = (value / total) * 100;
                  return (
                    <div
                      key={status}
                      style={{
                        background: STATUS_COLORS[status],
                        height: `${pct}%`,
                        transition: 'opacity 150ms ease',
                        opacity:
                          hovered &&
                          hovered.groupIdx === groupIdx &&
                          hovered.status !== status
                            ? 0.6
                            : 1,
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onMouseEnter={() => setHovered({ groupIdx, status })}
                      onMouseLeave={() => setHovered(null)}
                      aria-label={`${STATUS_LABELS[status]}: ${value}`}
                    >
                      {hovered &&
                        hovered.groupIdx === groupIdx &&
                        hovered.status === status && (
                          <div className="absolute left-1/2 -top-7 -translate-x-1/2 bg-white text-blue-700 px-2 py-1 rounded shadow text-xs z-10 whitespace-nowrap border border-blue-200">
                            {STATUS_LABELS[status]}: {value}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <span className="mt-2 text-xs text-gray-500">Total: {total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
