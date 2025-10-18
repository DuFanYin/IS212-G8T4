'use client';

interface metricProps {
  tasks: Array<{
    name: string | null;
    ongoing: number;
    under_review: number;
    completed: number;
    overdue: number;
  }>;
}

function calculateCompletionRate(tasks: metricProps['tasks']): number {
    const totalTasks = tasks.reduce((sum, t) => sum + t.ongoing + t.under_review + t.completed + t.overdue, 0);
    const completedTasks = tasks.reduce((sum, t) => sum + t.completed, 0);
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
}   

function calculateAverageCompletion(tasks: metricProps['tasks']): number {
    const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
    return totalCompleted / tasks.length;
}

function calculateOnTimeCompletion(tasks: metricProps['tasks']): number {
    const totalTasks = tasks.reduce((sum, t) => sum + t.ongoing + t.under_review + t.completed + t.overdue, 0);
    const onTimeCompleted = tasks.reduce((sum, t) => sum + (t.completed - t.overdue), 0);
    return totalTasks === 0 ? 0 : Math.round((onTimeCompleted / totalTasks) * 100);
}

function calculateOverdueRate(tasks: metricProps['tasks']): number {
    const totalTasks = tasks.reduce((sum, t) => sum + t.ongoing + t.under_review + t.completed + t.overdue, 0);
    const overdueTasks = tasks.reduce((sum, t) => sum + t.overdue, 0);
    return totalTasks === 0 ? 0 : Math.round((overdueTasks / totalTasks) * 100);
}

export default function ProductivityMetric({ tasks }: metricProps) {
    const completionRate = calculateCompletionRate(tasks);
    const averageCompletion = calculateAverageCompletion(tasks);
    const onTimeCompletion = calculateOnTimeCompletion(tasks);
    const overdueRate = calculateOverdueRate(tasks);

    return (
        <div className="w-full flex flex-col items-center justify-center py-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Productivity Metrics</h2>
            <div className="grid grid-cols-2 gap-6 w-full">
                {[
                    { label: "Completion Rate", value: completionRate },
                    { label: "Average Completion", value: averageCompletion },
                    { label: "On-Time Completion", value: onTimeCompletion },
                    { label: "Overdue Rate", value: overdueRate },
                ].map((metric) => (
                    <div key={metric.label} className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-100 shadow-xl bg-white min-h-[100px]">
                        <div className="text-xs font-medium text-gray-500 mb-2 whitespace-nowrap">{metric.label}</div>
                        <div className={`text-2xl font-semibold ${metric.label == "Completion Rate" ? "text-green-600" : metric.label == "Overdue Rate" ? "text-red-600" : "text-blue-600"}`}>
                            {metric.value}
                            <span className="text-base font-normal">{metric.label == "Average Completion" ? " tasks" : " %"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}