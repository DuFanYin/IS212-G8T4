import type { Task } from '@/lib/types/task';

/**
 * Centralized task status color utility
 * Eliminates duplication across TaskItem, TaskCard, and other components
 * 
 * High impact: Single source of truth for status styling across the app
 */
export function getStatusColor(status: Task['status']) {
  switch (status) {
    case 'unassigned':
      return 'bg-gray-100 text-gray-800';
    case 'ongoing':
      return 'bg-yellow-100 text-yellow-800';
    case 'under_review':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Priority color mapping
 * Consistent priority visualization across all task displays
 */
export function getPriorityColor(priority: number) {
  if (priority >= 8) return 'bg-red-100 text-red-800'; // High priority
  if (priority >= 6) return 'bg-orange-100 text-orange-800'; // Medium-high
  if (priority >= 4) return 'bg-yellow-100 text-yellow-800'; // Medium
  return 'bg-green-100 text-green-800'; // Low priority
}

/**
 * Check if task is overdue
 * Centralizes overdue logic used across multiple components
 */
export function isTaskOverdue(dueDate: string, status: Task['status']): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return due < today && status !== 'completed';
}

/**
 * Format status label for display
 */
export function formatStatusLabel(status: Task['status']): string {
  return status.replace('_', ' ').toUpperCase();
}
