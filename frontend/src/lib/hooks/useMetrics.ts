import { getVisibleTasks } from '@/lib/utils/orgAccess';
import type { Team } from '@/lib/services/organization';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { Task } from '@/lib/types/task';

interface MetricFetchParams {
  selectedDepartmentId: string | null;
  selectedTeamId: string | null;
  teams: Team[];
}

interface UseMetricsParams {
  teams: Team[];
  departments: Array<{ id: string; name: string }>;
  currentTeamName?: string;
}

type StatusBucket = {
  ongoing: number;
  under_review: number;
  completed: number;
  overdue: number;
};

type Row = {
  name: string;
  departmentName?: string;
} & StatusBucket;

export function useMetrics(params: UseMetricsParams) {
    const { user } = useUser();
    const { teams, departments, currentTeamName} = params;
    const [teamStats, setTeamStats] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);

    const emptyBuckets: StatusBucket = useMemo(
        () => ({ ongoing: 0, under_review: 0, completed: 0, overdue: 0 }),
        []
    );

    const countStatuses = useCallback(
        (tasks: Task[]): StatusBucket => {
        return tasks.reduce<StatusBucket>((acc, t) => {
            if (t.status === 'ongoing') acc.ongoing++;
            if (t.status === 'under_review') acc.under_review++;
            if (t.status === 'completed') acc.completed++;
            if (t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < new Date()) {
            acc.overdue++;
            }
            return acc;
        }, { ...emptyBuckets });
        },
        [emptyBuckets]
    );

    // Proper async helper you can call from components if needed
    const fetchTasksForMetrics = useCallback(
        async (params: MetricFetchParams): Promise<Task[]> => {
        const { selectedDepartmentId, selectedTeamId, teams } = params;
        if (!user?.token) return [];
            try {
                const resp = await getVisibleTasks(user.token, selectedDepartmentId, selectedTeamId, teams ?? []);
                if (resp.status !== 'success') throw new Error(resp.message || 'Failed to fetch tasks');
                const tasks = (resp.data ?? []) as Task[];
                return tasks;
            } catch (err) {
                console.error('Error fetching tasks for metrics:', err);
                return [];
            } 
        },
        [user?.token]
    );

    useEffect(() => {
        let cancelled = false;
        console.log(user);
        const loadTasks = async () => {
            if (!user?.token) {
                setTeamStats([]);
                return;
            }
            setLoading(true);
        try {
            const role = user?.role;
            let results: Row[] = [];


            if (role === 'hr' || role === 'sm') {
                // Aggregate by departments
                results = await Promise.all(
                departments.map(async (dept) => {
                    const rawTasks = await fetchTasksForMetrics({
                        selectedDepartmentId: dept.id,
                        selectedTeamId: null,
                        teams,
                    });
                    const valid = rawTasks.filter((t) => t.projectId && !t.isDeleted);
                    const buckets = countStatuses(valid);
                    return {
                        titleName: "Company",
                        name: dept.name,
                        ...buckets,
                    };
                })
            );
            } else if (role === 'manager') {
                const rawTasks = await fetchTasksForMetrics({
                    selectedDepartmentId: null,
                    selectedTeamId: user?.teamId || null,
                    teams,
                });
                const valid = rawTasks.filter((t) => t.projectId && !t.isDeleted);
                const buckets = countStatuses(valid);
                results = [
                    {
                        titleName: 'Team',
                        name: currentTeamName || 'Team',
                        ...buckets,
                    },
                ];
            } else if (role === 'staff') {
                // Personal aggregation
                const rawTasks = await fetchTasksForMetrics({
                    selectedDepartmentId: null,
                    selectedTeamId: null,
                    teams,
                });
                const valid = rawTasks.filter((t) => t.projectId && !t.isDeleted);
                const buckets = countStatuses(valid);
                results = [
                    {
                        titleName: 'Personal',
                        name: user?.name ?? 'Personal',
                        ...buckets,
                    },
                ];
            } else {
                // Aggregate by teams (for Director)
                results = await Promise.all(
                    teams.map(async (team) => {
                    const rawTasks = await fetchTasksForMetrics({
                        selectedDepartmentId: null,
                        selectedTeamId: team.id,
                        teams,
                    });
                    const valid = rawTasks.filter((t) => t.projectId && !t.isDeleted);
                    const buckets = countStatuses(valid);
                    return {
                        titleName: "Department",
                        name: team.name,
                        ...buckets,
                    };
                    })
                );
            }

                if (!cancelled) setTeamStats(results);
            } catch (e) {
                if (!cancelled) setTeamStats([]);
                console.error('loadTasks error:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [user?.token, user?.role, user?.teamId, user?.name, user?.departmentName, teams, departments, fetchTasksForMetrics, countStatuses]);

  return {
    teamStats,
    loading,
    fetchTasksForMetrics,
  };
}
