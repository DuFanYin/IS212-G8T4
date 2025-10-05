'use client';

import { organizationService, type Department, type Team } from '@/lib/services/organization';
import { taskService } from '@/lib/services/task';
import { getRoleRank } from '@/lib/utils/access';

interface LoadOrgSelectorsParams {
  token: string;
  user: { departmentId?: string | null; teamId?: string | null; role?: string | null } | null;
}

interface LoadOrgSelectorsResult {
  departments: Department[];
  teams: Team[];
  selectedDepartment: string | null;
  selectedTeam: string | null;
}

// Progressive org data loading that relies on backend authorization
export async function loadOrgSelectors(
  { token, user }: LoadOrgSelectorsParams
): Promise<LoadOrgSelectorsResult> {
  let departments: Department[] = [];
  let teams: Team[] = [];
  let selectedDepartment: string | null = null;
  let selectedTeam: string | null = null;

  const rank = getRoleRank(user?.role || undefined);
  const isManagerPlus = rank >= 2;
  const isDirectorPlus = rank >= 3;
  const isHROrSM = rank >= 4;

  // HR/SM: attempt all departments and teams
  if (isHROrSM) {
    try {
      const [deptRes, teamRes] = await Promise.all([
        organizationService.getAllDepartments(token),
        organizationService.getAllTeams(token)
      ]);
      if (deptRes.status === 'success') {
        departments = deptRes.data;
        selectedDepartment = departments[0]?.id || null;
      }
      if (teamRes.status === 'success') {
        teams = teamRes.data;
      }
      return { departments, teams, selectedDepartment, selectedTeam };
    } catch {}
  }

  // Department-level fallback (Director+)
  if (isDirectorPlus && user?.departmentId) {
    try {
      const teamRes = await organizationService.getTeamsByDepartment(token, user.departmentId);
      if (teamRes.status === 'success') {
        teams = teamRes.data;
        selectedDepartment = user.departmentId;
        selectedTeam = teams[0]?.id || null;
        return { departments, teams, selectedDepartment, selectedTeam };
      }
    } catch {}
  }

  // Team/self fallback (Manager/Staff)
  if (isManagerPlus) {
    selectedDepartment = user?.departmentId || null;
    selectedTeam = user?.teamId || null;
  } else {
    // Staff: show personal org labels only
    selectedDepartment = user?.departmentId || null;
    selectedTeam = user?.teamId || null;
  }
  return { departments, teams, selectedDepartment, selectedTeam };
}

// Progressive task fetching for selected org unit relying on backend authorization
export async function fetchOrgTasks(
  token: string,
  selectedDepartment: string | null,
  selectedTeam: string | null,
  teams: Team[]
) {
  // Note: The caller should have selectedDepartment/team based on role-aware selectors.
  // Prefer team tasks when team is selected and matches department (when present)
  const teamMatchesDept = !selectedDepartment
    || teams.length === 0
    || teams.find(t => t.id === selectedTeam)?.departmentId === selectedDepartment;

  if (selectedTeam && teamMatchesDept) {
    try {
      return await taskService.getTasksByTeam(token, selectedTeam);
    } catch {}
  }

  if (selectedDepartment) {
    try {
      return await taskService.getTasksByDepartment(token, selectedDepartment);
    } catch {}
  }

  return { status: 'error', message: 'Not authorized or no organization unit selected', data: [] };
}

// Shared utility: get all tasks visible to the user, then apply org selectors (team/department)
// Falls back to user-tasks visibility when org endpoints are not permitted (e.g., Staff)
export async function getVisibleTasks(
  token: string,
  selectedDepartment: string | null,
  selectedTeam: string | null,
  teams: Team[]
) {
  const orgResp = await fetchOrgTasks(token, selectedDepartment, selectedTeam, teams);
  if (orgResp.status === 'success') return orgResp;
  const userResp = await taskService.getUserTasks(token);
  if (userResp.status === 'success') return userResp;
  return orgResp; // propagate original error
}


