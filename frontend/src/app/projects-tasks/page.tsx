'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/lib/hooks/useTasks';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import { ProjectItem } from '@/components/features/projects/ProjectItem';
import { CreateTaskModal } from '@/components/forms/CreateTaskModal';
import { CreateProjectModal } from '@/components/forms/CreateProjectModal';
import type { User } from '@/lib/types/user';
import type { Task, CreateTaskRequest } from '@/lib/types/task';
import type { Project } from '@/lib/types/project';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';
import { storage } from '@/lib/utils/storage';

export default function ProjectsTasksPage() {
  const { user }: { user: User | null } = useUser();
  const { 
    createTask
  } = useTasks();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [projectTasksLoading, setProjectTasksLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('active');
  
  // Unassigned tasks state
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [unassignedTasksLoading, setUnassignedTasksLoading] = useState(false);
  const [showUnassignedTasks, setShowUnassignedTasks] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  
  const token = storage.getToken();

  useEffect(() => {
    if (!user?.token) return;
    
    async function fetchProjects() {
      try {
        const token = user?.token;
        if (!token) return;
        const json = await projectService.getProjects(token);
        const fetchedProjects = (json.data as Project[]) || [];
        setProjects(fetchedProjects);
        
        // Auto-select the first project
        if (fetchedProjects.length > 0 && !selectedProject) {
          setSelectedProject(fetchedProjects[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setProjectsError(err.message);
        } else {
          setProjectsError('Failed to fetch projects');
        }
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchProjects();
  }, [user?.token, selectedProject]);


  // Fetch tasks for selected project
  useEffect(() => {
    if (!selectedProject || !token) {
      setProjectTasks([]);
      return;
    }

    async function fetchProjectTasks() {
      if (!selectedProject) return;
      
      try {
        setProjectTasksLoading(true);
        const projectId = selectedProject.id || selectedProject._id;
        if (!projectId) return;
        
        const response = await taskService.getTasksByProject(token!, projectId);
        const fetchedTasks = response.data || [];
        setProjectTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to fetch project tasks:', err);
        setProjectTasks([]);
      } finally {
        setProjectTasksLoading(false);
      }
    }

    fetchProjectTasks();
  }, [selectedProject, token]);

  useEffect(() => {
    if (!showUnassignedTasks || !token) {
      setUnassignedTasks([]);
      return;
    }

    async function fetchUnassignedTasks() {
      try {
        setUnassignedTasksLoading(true);
        const response = await taskService.getUnassignedTasks(token!);
        const fetchedTasks = response.data || [];
        setUnassignedTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to fetch unassigned tasks:', err);
        setUnassignedTasks([]);
      } finally {
        setUnassignedTasksLoading(false);
      }
    }

    fetchUnassignedTasks();
  }, [showUnassignedTasks, token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const currentTasks = showUnassignedTasks ? unassignedTasks : projectTasks;
  const filteredTasks = currentTasks.filter(task => {
    if (selectedFilter === 'all') return true;
    return task.status === selectedFilter;
  });

  const filteredProjects = projects.filter(project => {
    if (selectedProjectFilter === 'active') return !project.isArchived;
    if (selectedProjectFilter === 'archived') return project.isArchived;
    return true; // 'all' case
  });

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    if (showUnassignedTasks) {
      // Create unassigned task (without projectId)
      await createTask(taskData);
      
      // Refresh unassigned tasks
      if (token) {
        try {
          const response = await taskService.getUnassignedTasks(token);
          setUnassignedTasks(response.data || []);
        } catch (err) {
          console.error('Failed to refresh unassigned tasks:', err);
        }
      }
    } else if (selectedProject) {
      const projectId = selectedProject.id || selectedProject._id;
      if (!projectId) return;
      
      const taskWithProject = { ...taskData, projectId };
      await createTask(taskWithProject);
      
      // Refresh project tasks
      if (token) {
        try {
          const response = await taskService.getTasksByProject(token, projectId);
          setProjectTasks(response.data || []);
        } catch (err) {
          console.error('Failed to refresh project tasks:', err);
        }
      }
    }
  };
  
  const handleCreateProject = async (data: { name: string; description?: string; deadline?: string; departmentId?: string; collaboratorIds?: string[] }) => {
    if (!token) return;
    const res = await projectService.createProject(token, data);
    if (res.status === 'success' && res.data) {
      setProjects((prev) => [res.data!, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Projects & Tasks</h1>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  New Project
                </button>
                {(selectedProject || showUnassignedTasks) && (
                  <button 
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Create Task
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Projects */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects</h2>
                
                {projectsError && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {projectsError}
                  </div>
                )}

                {projectsLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No projects found. Create your first project!
                  </div>
                ) : (
                  <>
                    {/* Project Filters */}
                    <div className="mb-6">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setShowUnassignedTasks(false);
                            setSelectedProjectFilter('active');
                          }}
                          className={`px-2 py-1 rounded text-xs flex-1 ${
                            selectedProjectFilter === 'active' && !showUnassignedTasks
                              ? 'bg-green-100 text-green-800'
                              : 'text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          Active ({projects.filter(p => !p.isArchived).length})
                        </button>
                        <button
                          onClick={() => {
                            setShowUnassignedTasks(false);
                            setSelectedProjectFilter('archived');
                          }}
                          className={`px-2 py-1 rounded text-xs flex-1 ${
                            selectedProjectFilter === 'archived' && !showUnassignedTasks
                              ? 'bg-orange-100 text-orange-800'
                              : 'text-gray-600 hover:bg-orange-50'
                          }`}
                        >
                          Archived ({projects.filter(p => p.isArchived).length})
                        </button>
                        <button
                          onClick={() => {
                            setShowUnassignedTasks(true);
                            setSelectedProject(null);
                          }}
                          className={`px-2 py-1 rounded text-xs flex-1 ${
                            showUnassignedTasks
                              ? 'bg-blue-100 text-blue-800'
                              : 'text-gray-600 hover:bg-blue-50'
                          }`}
                        >
                          Unassigned Tasks
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {filteredProjects.map((project) => {
                      const key = (project.id || project._id) as string;
                      const selectedKey = selectedProject ? (selectedProject.id || selectedProject._id) as string : null;
                      const isSelected = selectedKey === key;
                      
                      return (
                        <div key={key} className="relative">
                          <div
                            className={`cursor-pointer transition-all ${
                              isSelected 
                                ? 'ring-2 ring-blue-500 ring-opacity-50' 
                                : 'hover:shadow-lg'
                            }`}
                            onClick={() => setSelectedProject(project)}
                          >
                            <ProjectItem
                              project={project}
                            />
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Tasks */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {showUnassignedTasks ? 'Unassigned Tasks' : selectedProject ? `Tasks - ${selectedProject.name}` : 'Tasks'}
                </h2>

                {!selectedProject && !showUnassignedTasks ? (
                  <div className="p-8 text-center text-gray-500">
                    Select a project or view unassigned tasks
                  </div>
                ) : (
                  <>
                    {/* Task Filters */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-2">
                        <label htmlFor="task-filter" className="text-xs text-gray-700 font-medium mr-2">
                          Filter:
                        </label>
                        <select
                          id="task-filter"
                          value={selectedFilter}
                          onChange={e => setSelectedFilter(e.target.value as 'all' | 'unassigned' | 'ongoing' | 'under_review' | 'completed')}
                          className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="all">
                            All ({currentTasks.length})
                          </option>
                          <option value="unassigned">
                            Unassigned ({currentTasks.filter(t => t.status === 'unassigned').length})
                          </option>
                          <option value="ongoing">
                            Ongoing ({currentTasks.filter(t => t.status === 'ongoing').length})
                          </option>
                          <option value="under_review">
                            Review ({currentTasks.filter(t => t.status === 'under_review').length})
                          </option>
                          <option value="completed">
                            Done ({currentTasks.filter(t => t.status === 'completed').length})
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Task List */}
                    {(showUnassignedTasks ? unassignedTasksLoading : projectTasksLoading) ? (
                      <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {showUnassignedTasks 
                          ? (selectedFilter === 'all' 
                            ? 'No unassigned tasks found.'
                            : `No ${selectedFilter.replace('_', ' ')} unassigned tasks found.`)
                          : (selectedFilter === 'all' 
                            ? 'No tasks found in this project. Create your first task!'
                            : `No ${selectedFilter.replace('_', ' ')} tasks found.`)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredTasks.map((task) => (
                          <div key={task.id} className="relative">
                            <TaskItem
                              task={task}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />

    </div>
  );
}
