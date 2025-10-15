'use client';

import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import TasksMetric from '@/components/features/reports/tasksMetric';
import ProductivityMetric from '@/components/features/reports/productivityMetric';

export default function DepartmentReportPage() {
    const { user }: { user: User | null } = useUser();

    return (
        <main className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Department Report</h1>
            <TasksMetric />
            <ProductivityMetric />
        </main>
    );
}