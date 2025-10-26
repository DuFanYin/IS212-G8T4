import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { metricsService } from '@/lib/services/metrics';

type StatusBucket = {
  ongoing: number;
  under_review: number;
  completed: number;
  overdue: number;
};

type Row = {
  titleName?: string;
  name: string;
  departmentName?: string;
} & StatusBucket;

export function useMetrics() {
  const { user } = useUser();
  const [teamStats, setTeamStats] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    const loadMetrics = async () => {
      if (!user?.token || !user?.role) {
        setTeamStats([]);
        return;
      }

      setLoading(true);
      try {
        const role = user.role;
        let results: Row[] = [];

        if (role === 'hr' || role === 'sm') {
          const res = await metricsService.getDepartmentMetrics(user.token);
          if (res.status === 'success') {
            results = res.data;
          }
        } else if (role === 'manager') {
          const res = await metricsService.getSingleTeamMetrics(user.token, user.teamId || '');
          if (res.status === 'success') {
            results = res.data;
          }
        } else if (role === 'staff') {
          const res = await metricsService.getPersonalMetrics(user.token);
          if (res.status === 'success') {
            results = res.data;
          }
        } else if (role === 'director') {
          const res = await metricsService.getTeamMetrics(user.token);
          if (res.status === 'success') {
            results = res.data;
          }
        }

        if (!cancelled) setTeamStats(results);
      } catch (e) {
        console.error('loadMetrics error:', e);
        if (!cancelled) setTeamStats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    teamStats,
    loading
  };
}
