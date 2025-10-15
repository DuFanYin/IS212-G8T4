'use client';

import { useState } from 'react';

const data = [
    { department: 'HR', ongoing: 5, under_review: 2, completed: 8 },
    { department: 'Finance', ongoing: 3, under_review: 4, completed: 6 },
    { department: 'IT', ongoing: 7, under_review: 1, completed: 5 },
];

// Map status keys to professional labels
const STATUS_LABELS: Record<string, string> = {
    ongoing: 'On-going',
    under_review: 'Under Review',
    completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
    ongoing: '#2563eb',        // blue-600
    under_review: '#f59e42',   // amber-500
    completed: '#22c55e',      // green-500
};

export default function TasksMetric() {
    const [hovered, setHovered] = useState<{ deptIdx: number; status: string } | null>(null);

    return (
        <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Task Metrics</h2>
            <div className="flex gap-10">
                {data.map((dept, deptIdx) => {
                    const total = dept.ongoing + dept.under_review + dept.completed;
                    return (
                        <div key={dept.department} className="flex flex-col items-center">
                            <span className="mb-2 font-medium text-gray-700">{dept.department}</span>
                            <div className="relative flex flex-col-reverse h-40 w-10 border border-gray-200 rounded bg-gray-50">
                                {['completed', 'under_review', 'ongoing'].map(status => {
                                    const value = dept[status as keyof typeof dept];
                                    const height = total > 0 ? (value / total) * 160 : 0;
                                    return (
                                        <div
                                            key={status}
                                            style={{
                                                background: STATUS_COLORS[status],
                                                height: height,
                                                width: '100%',
                                                opacity: hovered && hovered.deptIdx === deptIdx && hovered.status !== status ? 0.6 : 1,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'opacity 0.2s',
                                            }}
                                            onMouseEnter={() => setHovered({ deptIdx, status })}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            {hovered && hovered.deptIdx === deptIdx && hovered.status === status && (
                                                <div className="absolute left-1/2 -top-8 -translate-x-1/2 bg-white text-gray-800 px-3 py-1 rounded shadow text-xs z-10 min-w-[120px] flex items-center justify-center whitespace-nowrap">
                                                    {STATUS_LABELS[status]}: {value}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="mt-2 text-xs text-gray-500">Total: {total}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-6 mt-6">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                        <span style={{ background: color }} className="inline-block w-4 h-4 rounded"></span>
                        <span className="text-sm text-gray-600">{STATUS_LABELS[status]}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}