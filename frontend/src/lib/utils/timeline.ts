import type { Project } from '@/lib/types/project';

export interface DateRange {
  start: Date;
  end: Date;
}

// Parse ISO string safely, fallback to now if invalid
const parseDate = (value?: string | null): Date => {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const getItemDates = (createdAt: string | undefined, dueDate: string | undefined): DateRange => {
  const start = parseDate(createdAt);
  const end = parseDate(dueDate || createdAt);
  return { start, end };
};

export const getProjectDates = (project: Project): DateRange => {
  // Backend provides createdAt (start) and deadline (end)
  const start = parseDate(project.createdAt);
  const end = parseDate(project.deadline || project.createdAt || undefined);
  return { start, end };
};


