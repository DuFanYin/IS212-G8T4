'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
// taskService is not needed directly; tasks are fetched via fetchOrgTasks
import { type Department, type Team } from '@/lib/services/organization';
import { storage } from '@/lib/utils/storage';
import { loadOrgSelectors, getVisibleTasks } from '@/lib/utils/orgAccess';
import { TaskItem } from '@/components/features/tasks/TaskItem';

type StatusFilter = 'all' | 'unassigned' | 'ongoing' | 'under_review' | 'completed';
type SortBy = 'due_asc' | 'due_desc';

export default function OrganizationPage() {
  const { user }: { user: User | null } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('due_asc');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const token = storage.getToken();

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user || !token) return;
      
      try {
        const res = await loadOrgSelectors({ token, user });
        setDepartments(res.departments);
        setTeams(res.teams);
        setSelectedDepartment(res.selectedDepartment);
        setSelectedTeam(res.selectedTeam);
      } catch (error) {
        console.error('Failed to load organization data:', error);
      }
    };
    
    loadOrganizationData();
  }, [user, token]);

  useEffect(() => {
    const load = async () => {
      if (!user || !token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const backendSortBy = 'dueDate';
        const backendOrder = sortBy === 'due_desc' ? 'desc' : 'asc';
        
        const res = await getVisibleTasks(token, selectedDepartment, selectedTeam, teams, {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sortBy: backendSortBy,
          order: backendOrder
        });
        
        if (res.status === 'success') {
          setTasks(res.data);
        } else {
          setTasks([]);
          setError(res.message || 'You are not authorized to view organization tasks.');
        }
      } catch {
        const unit = selectedTeam ? 'team' : (selectedDepartment ? 'department' : 'organization');
        setError(`Failed to fetch ${unit} tasks`);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user, token, selectedDepartment, selectedTeam, teams, statusFilter, sortBy]);

  const filteredSorted = tasks;
  
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Always render page; non-authorized users will see their fixed department/team values

  // Get current selection info
  const currentDepartment = departments.find(d => d.id === selectedDepartment);
  const currentTeam = teams.find(t => t.id === selectedTeam);
  
  const getPageTitle = () => {
    const showingTeam = !!selectedTeam;
    if (showingTeam) {
      return `Team: ${currentTeam?.name || 'Select Team'}`;
    }
    return `Department: ${currentDepartment?.name || 'Select Department'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Organization Tasks</h1>
            <p className="text-sm text-gray-500">{getPageTitle()}</p>
          </div>

          {/* Organization Selection Controls + Sort */}
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Department Selection (always visible; text-only if no permission) */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {departments.length > 0 ? (
                  <select
                    value={selectedDepartment || ''}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedTeam(null); // Reset team selection
                      setError(null);
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
                ) : (
                  <div
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                    aria-label="Department"
                  >
                    {currentDepartment?.name || user?.departmentName || 'My Department'}
                  </div>
                )}
              </div>

              {/* Team Selection (always visible; text-only if no permission) */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                {teams.filter(team => selectedDepartment ? team.departmentId === selectedDepartment : true).length > 0 ? (
                  <select
                    value={selectedTeam || ''}
                    onChange={(e) => {
                      setSelectedTeam(e.target.value);
                      setError(null);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Team</option>
                    {teams
                      .filter(team => selectedDepartment ? team.departmentId === selectedDepartment : true)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.userCount} users)
                        </option>
                      ))}
                  </select>
                ) : (
                  <div
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                    aria-label="Team"
                  >
                    {currentTeam?.name || user?.teamName || 'My Team'}
                  </div>
                )}
              </div>

              {/* Sort by due date (placed in the same row as selectors) */}
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full md:w-48"
                >
                  <option value="due_asc">Due Date (Earliest First)</option>
                  <option value="due_desc">Due Date (Latest First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task Summary (clickable KPI filters) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <button onClick={() => setStatusFilter('all')} className={`bg-white rounded shadow p-3 text-left border ${statusFilter==='all'?'border-blue-400':'border-slate-200'}`}>
              <div className="text-xs text-gray-500">All</div>
              <div className="text-xl font-semibold">{kpis.total}</div>
            </button>
            <button onClick={() => setStatusFilter('unassigned')} className={`bg-white rounded shadow p-3 text-left border ${statusFilter==='unassigned'?'border-blue-400':'border-slate-200'}`}>
              <div className="text-xs text-gray-500">Unassigned</div>
              <div className="text-xl font-semibold">{kpis.unassigned}</div>
            </button>
            <button onClick={() => setStatusFilter('ongoing')} className={`bg-white rounded shadow p-3 text-left border ${statusFilter==='ongoing'?'border-blue-400':'border-slate-200'}`}>
              <div className="text-xs text-gray-500">Ongoing</div>
              <div className="text-xl font-semibold">{kpis.ongoing}</div>
            </button>
            <button onClick={() => setStatusFilter('under_review')} className={`bg-white rounded shadow p-3 text-left border ${statusFilter==='under_review'?'border-blue-400':'border-slate-200'}`}>
              <div className="text-xs text-gray-500">Under Review</div>
              <div className="text-xl font-semibold">{kpis.under_review}</div>
            </button>
            <button onClick={() => setStatusFilter('completed')} className={`bg-white rounded shadow p-3 text-left border ${statusFilter==='completed'?'border-blue-400':'border-slate-200'}`}>
              <div className="text-xs text-gray-500">Completed</div>
              <div className="text-xl font-semibold">{kpis.completed}</div>
            </button>
            <div className="bg-white rounded shadow p-3 text-left border border-slate-200">
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
              No tasks found for the selected organization unit.
            </div>
          ) : (
            <div>
              {/* Controls row removed; KPI boxes are the filter, sort moved above */}

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