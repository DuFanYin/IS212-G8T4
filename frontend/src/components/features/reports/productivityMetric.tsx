'use client';

const metrics = [
    { label: "Completion Rate", value: 87},
    { label: "Average Completion", value: 2.3},
    { label: "On-Time Completion", value: 75},
    { label: "Overdue Rate", value: 13},
];

export default function ProductivityMetric() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Productivity Metrics</h2>
            <div className="grid grid-cols-2 gap-6 w-full">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-100 shadow-xl bg-white min-h-[100px]">
                        <div className="text-xs font-medium text-gray-500 mb-2 whitespace-nowrap">{metric.label}</div>
                        <div className={`text-2xl font-semibold ${metric.label == "Completion Rate" ? "text-green-600" : metric.label == "Overdue Rate" ? "text-red-600" : "text-blue-600"}`}>
                            {metric.value}
                            <span className="text-base font-normal">{metric.label == "Average Completion" ? " days" : " %"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}