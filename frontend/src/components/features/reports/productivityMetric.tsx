'use client';

const metrics = [
    { label: "Completion Rate", value: 87},
    { label: "Average Completion Time", value: 2.3},
    { label: "On-Time Completion Rate", value: 75},
    { label: "Overdue Rate", value: 13},
];

export default function ProductivityMetric() {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8 relative">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Productivity Metrics</h2>
            <div className="flex flex-row gap-8">
                {metrics.map((metric) => (
                    <div key={metric.label} className="flex-1 text-center">
                        <div className="text-sm font-medium text-gray-500 mb-2 whitespace-nowrap">{metric.label}</div>
                        <div className={`text-2xl font-semibold ${metric.label == "Completion Rate" ? "text-green-600" : metric.label == "Overdue Rate" ? "text-red-600" : "text-blue-600"}`}>
                            {metric.value}
                            <span className="text-base font-normal">{metric.label == "Average Completion Time" ? " days" : " %"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}