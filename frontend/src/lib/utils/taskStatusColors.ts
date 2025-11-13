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
  if (priority <= 3) return 'bg-red-100 text-red-800'; // High priority (1-3)
  if (priority <= 5) return 'bg-orange-100 text-orange-800'; // Medium-high (4-5)
  if (priority <= 7) return 'bg-yellow-100 text-yellow-800'; // Medium (6-7)
  return 'bg-green-100 text-green-800'; // Low priority (8-10)
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
