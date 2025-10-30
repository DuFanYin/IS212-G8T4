import { useState, useEffect } from 'react';
import { storage } from '@/lib/utils/storage';
import { loadOrgSelectors } from '@/lib/utils/orgAccess';
import type { User } from '@/lib/types/user';
import type { Department, Team } from '@/lib/services/organization';

interface UseOrgSelectorsReturn {
  departments: Department[];
  teams: Team[];
  selectedDepartment: string | null;
  selectedTeam: string | null;
  setSelectedDepartment: (id: string | null) => void;
  setSelectedTeam: (id: string | null) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing organizational selectors (departments and teams)
 * Handles loading, filtering teams by department, and permission-based visibility
 */
export function useOrgSelectors(user: User | null): UseOrgSelectorsReturn {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const token = storage.getToken();

  // Load department and team data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        const res = await loadOrgSelectors({ token, user });
        setDepartments(res.departments);
        setTeams(res.teams);
        setSelectedDepartment(res.selectedDepartment);
        setSelectedTeam(res.selectedTeam);
      } catch (error) {
        console.error('Failed to load organization data:', error);
        setError('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrganizationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  return {
    departments,
    teams,
    selectedDepartment,
    selectedTeam,
    setSelectedDepartment,
    setSelectedTeam,
    loading,
    error
  };
}

/**
 * Get teams filtered by selected department
 */
export function getFilteredTeams(teams: Team[], selectedDepartment: string | null): Team[] {
  if (!selectedDepartment) return teams;
  return teams.filter(team => team.departmentId === selectedDepartment);
}

/**
 * Get current department and team display names
 */
export function getCurrentOrgNames(
  departments: Department[],
  teams: Team[],
  selectedDepartment: string | null,
  selectedTeam: string | null,
  user: User | null
) {
  const currentDept = departments.find(d => d.id === selectedDepartment);
  const currentTeam = teams.find(t => t.id === selectedTeam);
  
  return {
    departmentName: currentDept?.name || user?.departmentName || 'No department',
    teamName: currentTeam?.name || user?.teamName || 'No team'
  };
}

