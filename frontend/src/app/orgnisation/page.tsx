'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/task';
import { organizationService, type Department, type Team } from '@/lib/services/organization';
import { storage } from '@/lib/utils/storage';
import { TaskItem } from '@/components/features/tasks/TaskItem';

type ViewType = 'department' | 'team';
type StatusFilter = 'all' | 'unassigned' | 'ongoing' | 'under_review' | 'completed';
type SortBy = 'due_asc' | 'due_desc' | 'status' | 'assignee' | 'project';

export default function OrganizationPage() {
  const { user }: { user: User | null } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('department');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_asc');
  
  // Organization data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const token = storage.getToken();

  // Role-based access control
  const normalizeRole = (role?: string) => (role || '').toLowerCase();
  const roleRank: Record<string, number> = {
    'staff': 1,
    'manager': 2,
    'director': 3,
    'hr': 4,
    'senior management': 5,
    'sm': 5
  };
  const getRank = (role?: string) => roleRank[normalizeRole(role)] || 0;
  
  // Determine available views based on role
  const canViewTeam = getRank(user?.role) >= 2; // Manager+
  const canViewDepartment = getRank(user?.role) >= 3; // Director+
  const canViewAll = getRank(user?.role) >= 4; // HR/SM+
  
  // Load organization data based on role
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user || !token) return;
      
      try {
        if (canViewAll) {
          // SM/HR: Load all departments and teams
          const [deptRes, teamRes] = await Promise.all([
            organizationService.getAllDepartments(token),
            organizationService.getAllTeams(token)
          ]);
          
          if (deptRes.status === 'success') setDepartments(deptRes.data);
          if (teamRes.status === 'success') setTeams(teamRes.data);
          
          // Set default selections
          if (deptRes.status === 'success' && deptRes.data.length > 0) {
            setSelectedDepartment(deptRes.data[0].id);
          }
        } else if (canViewDepartment) {
          // Director: Load teams for their department
          if (user.departmentId) {
            const teamRes = await organizationService.getTeamsByDepartment(token, user.departmentId);
            if (teamRes.status === 'success') {
              setTeams(teamRes.data);
              setSelectedDepartment(user.departmentId);
              if (teamRes.data.length > 0) {
                setSelectedTeam(teamRes.data[0].id);
              }
            }
          }
        } else if (canViewTeam) {
          // Manager: Only their team
          setSelectedTeam(user.teamId || null);
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      }
    };
    
    loadOrganizationData();
  }, [user, token, canViewAll, canViewDepartment, canViewTeam]);

  // Load tasks based on selected organization unit
  useEffect(() => {
    const load = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let res;
        if (activeView === 'team' && selectedTeam) {
          res = await taskService.getTasksByTeam(token, selectedTeam);
        } else if (activeView === 'department' && selectedDepartment) {
          res = await taskService.getTasksByDepartment(token, selectedDepartment);
        } else {
          setLoading(false);
          return;
        }
        
        if (res.status === 'success') {
          setTasks(res.data);
        } else {
          setError(res.message || `Failed to fetch ${activeView} tasks`);
        }
      } catch {
        setError(`Failed to fetch ${activeView} tasks`);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user, token, activeView, selectedDepartment, selectedTeam]);

  const kpis = useMemo(() => {
    const now = new Date();
    const counts = {
      total: tasks.length,
      unassigned: tasks.filter(t => t.status === 'unassigned').length,
      ongoing: tasks.filter(t => t.status === 'ongoing').length,
      under_review: tasks.filter(t => t.status === 'under_review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
    };
    return counts;
  }, [tasks]);

  const filteredSorted = useMemo(() => {
    const base = statusFilter === 'all' ? tasks : tasks.filter(t => t.status === statusFilter);
    const arr = [...base];
    if (sortBy === 'due_asc') arr.sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
    if (sortBy === 'due_desc') arr.sort((a, b) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime());
    if (sortBy === 'status') arr.sort((a, b) => a.status.localeCompare(b.status));
    if (sortBy === 'assignee') arr.sort((a, b) => (a.assigneeName || '').localeCompare(b.assigneeName || ''));
    if (sortBy === 'project') arr.sort((a, b) => (a.projectName || '').localeCompare(b.projectName || ''));
    return arr;
  }, [tasks, statusFilter, sortBy]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Check if user has any access
  if (!canViewTeam && !canViewDepartment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded shadow text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access restricted</h2>
          <p className="text-gray-600 text-sm">You need Manager+ role to view organization tasks.</p>
        </div>
      </div>
    );
  }

  // Get current selection info
  const currentDepartment = departments.find(d => d.id === selectedDepartment);
  const currentTeam = teams.find(t => t.id === selectedTeam);
  
  const getPageTitle = () => {
    if (canViewAll) {
      return activeView === 'department' 
        ? `Department: ${currentDepartment?.name || 'Select Department'}`
        : `Team: ${currentTeam?.name || 'Select Team'}`;
    } else if (canViewDepartment) {
      return activeView === 'department'
        ? `Department: ${currentDepartment?.name || 'My Department'}`
        : `Team: ${currentTeam?.name || 'Select Team'}`;
    } else {
      return `Team: ${currentTeam?.name || 'My Team'}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Organization Tasks</h1>
            <p className="text-sm text-gray-500">{getPageTitle()}</p>
          </div>

          {/* Organization Selection Controls */}
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Department Selection (SM/HR only) */}
              {canViewAll && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={selectedDepartment || ''}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedTeam(null); // Reset team selection
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.teamCount} teams, {dept.userCount} users)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Team Selection (Director+ or SM/HR with department selected) */}
              {(canViewDepartment || (canViewAll && selectedDepartment)) && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    value={selectedTeam || ''}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={canViewAll && !selectedDepartment}
                  >
                    <option value="">Select Team</option>
                    {teams
                      .filter(team => canViewAll ? team.departmentId === selectedDepartment : true)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.userCount} users)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* View Type Selection */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Type
                </label>
                <select
                  value={activeView}
                  onChange={(e) => setActiveView(e.target.value as ViewType)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {canViewDepartment && (
                    <option value="department">Department Tasks</option>
                  )}
                  {canViewTeam && (
                    <option value="team">Team Tasks</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xl font-semibold">{kpis.total}</div>
            </div>
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Unassigned</div>
              <div className="text-xl font-semibold">{kpis.unassigned}</div>
            </div>
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Ongoing</div>
              <div className="text-xl font-semibold">{kpis.ongoing}</div>
            </div>
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Under Review</div>
              <div className="text-xl font-semibold">{kpis.under_review}</div>
            </div>
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Completed</div>
              <div className="text-xl font-semibold">{kpis.completed}</div>
            </div>
            <div className="bg-white rounded shadow p-3">
              <div className="text-xs text-gray-500">Overdue</div>
              <div className="text-xl font-semibold">{kpis.overdue}</div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading tasks...</div>
          ) : filteredSorted.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              No {activeView} tasks found for the selected organization unit.
            </div>
          ) : (
            <div>
              {/* Controls */}
              <div className="bg-white p-3 rounded shadow mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {(['all','unassigned','ongoing','under_review','completed'] as const).map(key => (
                    <button 
                      key={key} 
                      onClick={() => setStatusFilter(key)} 
                      className={`px-3 py-1.5 rounded text-sm ${
                        statusFilter === key 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {key.replace('_',' ')} {key === 'all' ? `(${kpis.total})` : ''}
                    </button>
                  ))}
                </div>
                <div>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value as SortBy)} 
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="due_asc">Due date ↑</option>
                    <option value="due_desc">Due date ↓</option>
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    {activeView === 'department' && <option value="project">Project</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSorted.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
