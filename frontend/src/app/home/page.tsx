'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import type { Task } from '@/lib/types/task';
import type { Project } from '@/lib/types/project';
import { useTasks } from '@/lib/hooks/useTasks';
import { TaskItem } from '@/components/features/tasks/TaskItem';
import { ProjectItem } from '@/components/features/projects/ProjectItem';
import { useRouter } from 'next/navigation';
import { projectService } from '@/lib/services/project';
import { taskService } from '@/lib/services/task';

export default function HomePage() {
  const { user }: { user: User | null } = useUser();
  const { tasks, loading: tasksLoading, error } = useTasks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [projectsLoading, setProjectsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.token) return;
    const token = user.token;

    async function fetchProjectsAndCounts(token: string) {
      try {
        const json = await projectService.getProjects(token);
        const fetchedProjects = (json.data as Project[]) || [];
        setProjects(fetchedProjects);

        const entries = await Promise.all(
          fetchedProjects.map(async (p) => {
            const id = (p.id || p._id) as string;
            if (!id) return [id, 0] as const;
            try {
              const tasksRes = await taskService.getTasksByProject(token, id);
              const t = tasksRes.data || [];
              const activeCount = t.filter(task => task.status !== 'completed').length;
              return [id, activeCount] as const;
            } catch {
              return [id, 0] as const;
            }
          })
        );
        const counts: Record<string, number> = {};
        for (const [id, count] of entries) {
          if (id) counts[id] = count;
        }
        setProjectCounts(counts);
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchProjectsAndCounts(token);
  }, [user?.token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const isLoading = tasksLoading || projectsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {isLoading ? (
            <div className="text-gray-500">Loading your data...</div>
          ) : (
            <>
              {/* My Tasks */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                </div>
                {tasks.length === 0 ? (
                  <div className="p-6 bg-white rounded-lg shadow text-gray-500">No tasks found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task: Task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={() => {}}
                        onAssign={() => {}}
                        onStatusChange={() => {}}
                        onArchive={() => {}}
                        canAssign={false}
                        readOnly
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* My Projects */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
                </div>
                {projects.length === 0 ? (
                  <div className="p-6 bg-white rounded-lg shadow text-gray-500">No projects found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: Project) => {
                      const id = (project.id || project._id) as string;
                      return (
                        <ProjectItem
                          key={id}
                          project={project}
                          onToggleArchive={() => {}}
                          collabValue={''}
                          onChangeCollabValue={() => {}}
                          onAddCollaborator={() => {}}
                          onRemoveCollaborator={() => {}}
                          activeTaskCount={projectCounts[id] ?? 0}
                          readOnly
                          onClick={() => router.push(`/projects/${id}`)}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


