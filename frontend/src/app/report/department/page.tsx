'use client';

import { useUser } from '@/contexts/UserContext';
import TasksMetric from '@/components/features/reports/tasksMetric';
import ProductivityMetric from '@/components/features/reports/productivityMetric';
import ProductivityIndex from '@/components/features/reports/productivityIndex';
import WorkTable from '@/components/features/reports/workTable';
import { useMetrics } from '@/lib/hooks/useMetrics';

export default function DepartmentReportPage() {
    useUser(); // Initialize context
    const { teamStats, loading } = useMetrics({ teams: [], departments: [] });

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto py-8 px-4">
                <div className="text-center">Loading metrics...</div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Department Report</h1>
            <TasksMetric tasks={teamStats} />
            <ProductivityMetric tasks={teamStats} />
            <ProductivityIndex tasks={teamStats} />
            <WorkTable />
        </main>
    );
}