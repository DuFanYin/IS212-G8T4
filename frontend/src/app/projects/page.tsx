'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/lib/types/user';
import { formatDate } from '@/lib/utils/formatDate';

export default function ProjectsPage() {
  const { user }: { user: User | null } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('grid');

  useEffect(() => {
    if (!user) return;
    
    async function fetchProjects() {
      try {
        const res = await fetch('http://localhost:3000/api/projects/projects', {
          method: 'GET', // optional, GET is default
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
        });
        const json = await res.json();
        setProjects(json.data || []);
      } catch (err) {
        if(err instanceof Error){
          console.error('Failed to fetch projects:', err.message);
        }
        else{
          console.error('Failed to fetch projects:', err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedView('grid')}
                    className={`p-2 rounded ${
                      selectedView === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedView('list')}
                    className={`p-2 rounded ${
                      selectedView === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  New Project
                </button>
              </div>
            </div>
          </div>

          {/* Project Grid/List View */}
          {selectedView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Project Card */}
              {projects.map((project: any) => (
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                      <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">{!project.isArchived ? "Active" : "Archived"}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due: {formatDate(project.deadline)}</span>
                        <span className="text-gray-500">{project.hasContainedTasks ? "5" : "0"} active tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                {/* Project List Item */}
                {projects.map((project: any) => (
                  <div className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h2 className="text-xl font-semibold text-gray-900 mr-3">{project.name}</h2>
                          <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800">{!project.isArchived ? "Active" : "Archived"}</span>
                        </div>
                        <p className="text-gray-600 mb-3">Complete overhaul of company website with modern design</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(project.deadline)}</span>
                          <span>•</span>
                          <span>{project.hasContainedTasks ? "5" : "0"} active tasks</span>
                          <span>•</span>
                          <span>60% complete</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <button className="text-gray-400 hover:text-gray-500">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
