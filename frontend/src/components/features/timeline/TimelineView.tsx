'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { useTimeline, type TimelineItem } from '@/lib/hooks/useTimeline';
import { useRouter } from 'next/navigation';

export function TimelineView() {
  const { timelineItems, loading, error } = useTimeline();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  type TimelineRow = { type: 'project' | 'task' | 'subtask'; item?: TimelineItem; projectName?: string };
  // Build rows grouped by project → task → (expanded) subtasks
  const rows = useMemo<TimelineRow[]>(() => {
    const items = filterStatus !== 'all'
      ? timelineItems.filter(i => i.status === filterStatus)
      : timelineItems;

    const tasks = items.filter(i => i.type === 'task');
    const subtasks = items.filter(i => i.type === 'subtask');

    const byProject = new Map<string, TimelineItem[]>();
    tasks.forEach(t => {
      const key = t.projectName || 'No Project';
      const list = byProject.get(key) || [];
      list.push(t);
      byProject.set(key, list);
    });

    // Sort projects alphabetically, tasks by newest first
    const projectNames = Array.from(byProject.keys()).sort((a, b) => a.localeCompare(b));

    const result: TimelineRow[] = [];
    projectNames.forEach(project => {
      result.push({ type: 'project', projectName: project });
      const isProjectExpanded = !expandedProjects.has(project);
      if (!isProjectExpanded) {
        return;
      }
      const projectTasks = (byProject.get(project) || [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      projectTasks.forEach(task => {
        result.push({ type: 'task', item: task });
        if (expandedTasks.has(task.id)) {
          const taskSubs = subtasks
            .filter(s => s.parentTaskId === task.id)
            .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          taskSubs.forEach(st => result.push({ type: 'subtask', item: st }));
        }
      });
    });

    // Orphan subtasks whose parent tasks are not included
    const taskIds = new Set(tasks.map(t => t.id));
    const orphans = subtasks
      .filter(s => !taskIds.has(s.parentTaskId || ''))
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    if (orphans.length > 0) {
      result.push({ type: 'project', projectName: 'Other' });
      orphans.forEach(st => result.push({ type: 'subtask', item: st }));
    }

    return result;
  }, [timelineItems, filterStatus, expandedTasks, expandedProjects]);
  const router = useRouter();

  // Remove redundant filteredItems; grouping covers it

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Calculate timeline bounds with precise day alignment
  const timelineBounds = useMemo(() => {
    const itemsInRows = rows.filter(r => r.item).map(r => r.item!) as TimelineItem[];
    if (itemsInRows.length === 0) return { start: new Date(), end: new Date() };
    
    const allDates = itemsInRows.flatMap(item => [
      new Date(item.createdAt),
      new Date(item.dueDate)
    ]);
    
    const minDate = Math.min(...allDates.map(d => d.getTime()));
    const maxDate = Math.max(...allDates.map(d => d.getTime()));
    
    // Round to midnight for cleaner grid alignment
    const start = new Date(minDate - (7 * 24 * 60 * 60 * 1000)); // One week before
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(maxDate + (7 * 24 * 60 * 60 * 1000)); // One week after  
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [rows]);

  // Calculate position of today line
  const todayLinePosition = useMemo(() => {
    const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
    const todayMs = new Date().getTime() - timelineBounds.start.getTime();
    return Math.max(0, Math.min(100, (todayMs / totalMs) * 100));
  }, [timelineBounds]);

  // We compute bar geometry inline during render based on rows & bounds

  // Fixed row height regardless of row count
  const rowHeight = 40;

  const itemsCount = useMemo(() => {
    return rows.reduce((acc, r) => acc + (r.type === 'task' || r.type === 'subtask' ? 1 : 0), 0);
  }, [rows]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  // Precompute date header labels and vertical grid lines
  const dateHeaderLabels = useMemo<ReactNode[]>(() => {
    const labels: ReactNode[] = [];
    const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    let lastRenderedLeft = -Infinity;
    const minGapPercent = 8; // avoid overlap by requiring gap between labels
    for (let i = 0; i < totalMs; i += weekMs) {
      const left = (i / totalMs) * 100;
      if (left - lastRenderedLeft < minGapPercent) continue;
      lastRenderedLeft = left;
      const date = new Date(timelineBounds.start.getTime() + i);
      labels.push(
        <div key={`hdr-${i}`} className="absolute text-[11px] leading-4 text-gray-600 font-medium bg-white/80 px-1 rounded" style={{ left: `${left}%`, transform: 'translateX(-50%)', top: '4px' }}>
          {formatDate(date)}
        </div>
      );
    }
    return labels;
  }, [timelineBounds]);

  const verticalGridLines = useMemo<ReactNode[]>(() => {
    const lines: ReactNode[] = [];
    const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < totalMs; i += weekMs) {
      const left = (i / totalMs) * 100;
      lines.push(
        <div key={`vl-${i}`} className="absolute top-0 bottom-0 w-px bg-gray-200 z-10" style={{ left: `${left}%` }} />
      );
    }
    return lines;
  }, [timelineBounds]);

  // Removed old precomputed bars (now align bars to rows directly)

  const handleClick = (item: TimelineItem) => {
    if (item.type === 'task') {
      // Check if task has subtasks - if so, toggle expansion
      const hasSubtasks = timelineItems.some(subtask => 
        subtask.type === 'subtask' && subtask.parentTaskId === item.id
      );
      
      if (hasSubtasks) {
        toggleTaskExpansion(item.id);
      } else {
        // No subtasks, navigate to task detail
        router.push(`/projects-tasks/task/${item.id}`);
      }
    } else {
      // Subtask click - navigate to parent task
      router.push(`/projects-tasks/task/${item.parentTaskId}`);
    }
  };

  // Removed unused hasSubtasks helper

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="text-gray-800">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Task Timeline
                </h1>
                <p className="text-sm text-gray-500">Visualize your tasks and subtasks with interactive timeline view</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Legend moved into header */}
                <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Ongoing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Under Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Overdue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-700">Unassigned</span>
                  </div>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All Status</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="under_review">Under Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        {rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500">No items match your current filter criteria.</p>
          </div>
        ) : (
          <div>
            <div className="p-6 overflow-x-auto">
              {/* Two-column swimlane layout */}
              <div className="flex w-full">
                {/* Left rail: swimlane labels */}
                <div className="w-72 flex-shrink-0">
                  {/* Header row */}
                  <div className="h-9 px-3 flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50">
                    Items ({itemsCount})
                  </div>
                  {/* Rows */}
                  <div className="relative" style={{ height: `${rows.length * rowHeight}px` }}>
                    {rows.map((row, index) => {
                      if (row.type === 'project') {
                        const rowTop = index * rowHeight;
                        const expanded = !expandedProjects.has(row.projectName || '');
                        return (
                          <div key={`proj-${row.projectName}-${index}`} className="bg-gray-200 border-t border-slate-300" style={{ height: `${rowHeight}px` }}>
                            <div className="absolute inset-x-0" style={{ top: `${rowTop}px`, height: `${rowHeight}px` }}>
                              <div className="h-full flex items-center px-3 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                <button
                                  onClick={() => {
                                    setExpandedProjects(prev => {
                                      const next = new Set(prev);
                                      const key = row.projectName || '';
                                      if (next.has(key)) next.delete(key); else next.add(key);
                                      return next;
                                    });
                                  }}
                                  className="p-1 rounded hover:bg-gray-300 text-gray-700 mr-2"
                                  aria-label={expanded ? 'Collapse project' : 'Expand project'}
                                >
                                  <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                {row.projectName}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      const item = row.item!;
                      const isTask = row.type === 'task';
                      const expanded = isTask && expandedTasks.has(item.id);
                      const subtasksCount = isTask ? timelineItems.filter(s => s.type === 'subtask' && s.parentTaskId === item.id).length : 0;
                      const rowTop = index * rowHeight;
                      const isSubtask = row.type === 'subtask';
                      // indent subtasks under expanded parents
                      const parentExpanded = isSubtask ? expandedTasks.has(item.parentTaskId || '') : false;
                      return (
                        <div key={`${item.id}-row`} className={`${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} group`} style={{ height: `${rowHeight}px` }}>
                          <div className="absolute inset-x-0" style={{ top: `${rowTop}px`, height: `${rowHeight}px` }}>
                            <div className="h-full flex items-center px-3 gap-2">
                              {/* Caret for tasks with subtasks */}
                              {isTask && subtasksCount > 0 ? (
                                <button
                                  onClick={() => toggleTaskExpansion(item.id)}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                  aria-label={expanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <span className="w-6" />
                              )}
                              {/* Removed emojis/icon */}
                              {/* Title */}
                              <button
                                onClick={() => handleClick(item)}
                                className={`text-sm text-gray-800 font-medium truncate text-left flex-1 hover:underline ${isTask ? 'pl-1' : ''} ${isSubtask && parentExpanded ? 'pl-6' : ''}`}
                                title={item.title}
                              >
                                {item.title}
                              </button>
                              {/* Status removed from left rail */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right grid: timeline axis and bars */}
                <div className="relative flex-1 overflow-hidden">
                  {/* Header for dates */}
                  <div className="h-9 bg-gray-50 relative">
                    {dateHeaderLabels}
                    {/* Today line in header for consistent alignment */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                      style={{ left: `${todayLinePosition}%` }}
                    />
                  </div>
                  <div 
                    className="relative"
                    style={{ height: `${rows.length * rowHeight}px` }}
                  >
                    {/* Vertical grid lines */}
                    {verticalGridLines}
                    {/* Row backgrounds for swimlanes */}
                    {rows.map((row, index) => (
                      <div
                        key={`bg-${index}`}
                        className={`${row.type === 'project' ? 'bg-gray-200' : index % 2 === 0 ? 'bg-gray-50/60' : 'bg-white/60'}`}
                        style={{ position: 'absolute', left: 0, right: 0, top: `${index * rowHeight}px`, height: `${rowHeight}px` }}
                      />
                    ))}
                    {/* Today line (no label) */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                      style={{ left: `${todayLinePosition}%` }}
                    />
                    {/* Timeline bars - simple colored rectangles aligned to item rows */}
                    {rows.map((row, index) => {
                      if (!row.item || (row.type !== 'task' && row.type !== 'subtask')) return null;
                      const item = row.item;
                      const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
                      const startMs = new Date(item.createdAt).getTime() - timelineBounds.start.getTime();
                      const endMs = new Date(item.dueDate).getTime() - timelineBounds.start.getTime();
                      const leftPercent = Math.max(0, (startMs / totalMs) * 100);
                      const widthPercent = Math.min(100 - leftPercent, Math.max(5, ((endMs - startMs) / totalMs) * 100));
                      const barHeight = row.type === 'task' ? 16 : 8;
                      const top = index * rowHeight + (rowHeight - barHeight) / 2;
                      const isOverdue = new Date(item.dueDate) < new Date();
                      const isCompleted = item.status === 'completed';
                      const colorClass = isCompleted
                        ? 'bg-green-500'
                        : isOverdue
                        ? 'bg-red-500'
                        : item.status === 'ongoing'
                        ? 'bg-blue-500'
                        : item.status === 'under_review'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400';
                      return (
                        <div
                          key={item.id}
                          className={`absolute cursor-pointer z-40 ${colorClass} rounded-sm shadow-sm`}
                          style={{
                            left: `${leftPercent.toFixed(3)}%`,
                            top: `${top}px`,
                            width: `${widthPercent.toFixed(3)}%`,
                            height: `${barHeight}px`,
                          }}
                          title={`${item.title} ${isOverdue ? '(Overdue)' : ''}`}
                          onClick={() => handleClick(item)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend removed (moved to header) */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}