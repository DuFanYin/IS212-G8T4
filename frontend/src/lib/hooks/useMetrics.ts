import { getVisibleTasks } from '@/lib/utils/orgAccess';
import type { Team } from '@/lib/services/organization';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import type { Task } from '@/lib/types/task';

// Params shape for an explicit fetch call (not required by the hook itself)
interface MetricFetchParams {
    selectedDepartmentId: string | null;
    selectedTeamId: string | null;
    teams?: Team[];
}

// Proper React hook (not async) that provides metric tasks and a fetch helper
export function useMetrics() {
    const { user } = useUser();
    const [metricTasks, setMetricTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    // Called by consumers to fetch tasks for a particular department/team
    const fetchTasksForMetrics = async (
        selectedDepartmentId: string | null,
        selectedTeamId: string | null,
        teams?: Team[]
    ) => {
        if (!user?.token) return [] as Task[];

        setLoading(true);
        try {
            const resp = await getVisibleTasks(user.token, selectedDepartmentId, selectedTeamId, teams ?? []);
            if (resp.status !== 'success') throw new Error(resp.message || 'Failed to fetch tasks');
            const tasks = resp.data as Task[];
            setMetricTasks(tasks);
            return tasks;
        } catch (err) {
            console.error('Error fetching tasks for metrics:', err);
            return [] as Task[];
        } finally {
            setLoading(false);
        }
    };

    return {
        metricTasks,
        loading,
        fetchTasksForMetrics,
    };
}