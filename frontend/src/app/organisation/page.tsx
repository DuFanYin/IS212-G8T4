'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
// taskService is not needed directly; tasks are fetched via fetchOrgTasks
import { type Department, type Team } from '@/lib/services/organization';
import { storage } from '@/lib/utils/storage';
import { loadOrgSelectors, getVisibleTasks } from '@/lib/utils/orgAccess';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import { TaskSortSelect } from '@/components/features/TaskSortSelect';
import { TaskStatusFilter } from '@/components/features/TaskStatusFilter';
import { useTaskFilters } from '@/lib/hooks/useTaskFilters';

export default function OrganizationPage() {
  const { user }: { user: User | null } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const token = storage.getToken();
  
  // Use centralized filtering/sorting hook
  const {
    statusFilter,
    sortBy,
    setStatusFilter,
    setSortBy,
    filteredAndSortedTasks,
    taskCounts: kpis
  } = useTaskFilters({ tasks });

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
        
        // Fetch ALL tasks without status filter so KPI counts remain accurate
        // Client-side filtering via useTaskFilters will handle the filtering
        // Only send sort params to backend for due date sorting
        const res = await getVisibleTasks(token, selectedDepartment, selectedTeam, teams, {
          sortBy: sortBy.startsWith('due_') ? 'dueDate' : undefined,
          order: sortBy === 'due_desc' ? 'desc' : sortBy === 'due_asc' ? 'asc' : undefined
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
  }, [user, token, selectedDepartment, selectedTeam, teams, sortBy]);

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
                <TaskSortSelect
                  value={sortBy}
                  onChange={setSortBy}
                  size="md"
                  className="w-full md:w-56"
                />
              </div>
            </div>
          </div>

          {/* Task Summary (clickable KPI filters) */}
          <div className="mb-6">
            <TaskStatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
              counts={kpis}
              variant="buttons"
              showOverdue={true}
              overdueCount={kpis.overdue}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">Loading tasks...</div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              No tasks found for the selected organization unit.
            </div>
          ) : (
            <div>
              {/* Controls row removed; KPI boxes are the filter, sort moved above */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedTasks.map((task) => (
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