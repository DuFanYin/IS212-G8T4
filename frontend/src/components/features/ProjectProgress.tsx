'use client';

import React, { useState, useEffect } from 'react';
import { projectService } from '@/lib/services/project';
import { useUser } from '@/contexts/UserContext';

interface ProjectProgressProps {
  projectId: string;
}

interface ProgressData {
  total: number;
  unassigned: number;
  ongoing: number;
  under_review: number;
  completed: number;
  percent: number;
}

export default function ProjectProgress({ projectId }: ProjectProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.token) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await projectService.getProjectProgress(user.token, projectId);
        
        if (response.status === 'success') {
          setProgress(response.data);
        } else {
          setError('Failed to fetch project progress');
        }
      } catch (err) {
        setError('Failed to fetch project progress');
        console.error('Error fetching project progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [projectId, user?.token]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          ></div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{progress.ongoing}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{progress.unassigned}</div>
          <div className="text-sm text-gray-600">Unassigned</div>
        </div>
      </div>

      {/* Additional Status */}
      {progress.under_review > 0 && (
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-purple-600">{progress.under_review}</div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
      )}
    </div>
  );
}
