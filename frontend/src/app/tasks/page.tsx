'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { User } from '@/types/user';

export default function TasksPage() {
  const { user }: { user: User | null } = useUser();
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (!user) {
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
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Create New Task
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setSelectedFilter('unassigned')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'unassigned'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unassigned
              </button>
              <button
                onClick={() => setSelectedFilter('ongoing')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'ongoing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setSelectedFilter('review')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'review'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setSelectedFilter('completed')}
                className={`px-4 py-2 rounded ${
                  selectedFilter === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y">
              {/* Sample Task Items */}
              <div className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium mr-3">Implement New Homepage</h3>
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">
                        Ongoing
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Design and implement the new homepage layout with responsive design
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: Dec 31, 2023</span>
                      <span>•</span>
                      <span>Project: Website Redesign</span>
                      <span>•</span>
                      <span>2 subtasks</span>
                      <span>•</span>
                      <span>3 comments</span>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium mr-3">Update Privacy Policy</h3>
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-sm">
                        Under Review
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Review and update the privacy policy to comply with new regulations
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: Dec 25, 2023</span>
                      <span>•</span>
                      <span>Project: Legal Compliance</span>
                      <span>•</span>
                      <span>1 attachment</span>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
