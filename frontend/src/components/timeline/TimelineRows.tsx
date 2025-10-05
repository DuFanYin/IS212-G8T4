import type { TimelineItem } from '@/lib/hooks/useTimeline';

export function TimelineRows(props: {
  rows: Array<{ type: 'project' | 'task' | 'subtask'; item?: TimelineItem; projectName?: string }>;
  rowHeights: number[];
  rowOffsets: number[];
  totalHeight: number;
  itemsCount: number;
  expandedProjects: Set<string>;
  onToggleProject: (projectName: string) => void;
  expandedTasks: Set<string>;
  onToggleTask: (taskId: string) => void;
  timelineItems: TimelineItem[];
  handleClick: (item: TimelineItem) => void;
}) {
  const { rows, rowHeights, rowOffsets, totalHeight, itemsCount, expandedProjects, onToggleProject, expandedTasks, onToggleTask, timelineItems, handleClick } = props;
  return (
    <div className="w-72 flex-shrink-0">
      <div className="h-9 px-3 flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50">
        Items ({itemsCount})
      </div>
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {rows.map((row, index) => {
          if (row.type === 'project') {
            const rowTop = rowOffsets[index];
            const thisRowHeight = rowHeights[index];
            const expanded = !expandedProjects.has(row.projectName ?? '');
            return (
              <div key={`proj-${row.projectName}-${index}`} className="bg-gray-200 border-t border-slate-300" style={{ height: `${thisRowHeight}px` }}>
                <div className="absolute inset-x-0" style={{ top: `${rowTop}px`, height: `${thisRowHeight}px` }}>
                  <div className="h-full flex items-center px-3 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                    <button
                      onClick={() => onToggleProject(row.projectName ?? '')}
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
          const rowTop = rowOffsets[index];
          const thisRowHeight = rowHeights[index];
          const isSubtask = row.type === 'subtask';
          const parentExpanded = isSubtask ? expandedTasks.has(item.parentTaskId ?? '') : false;
          return (
            <div key={`${item.id}-row`} className={`${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} group`} style={{ height: `${thisRowHeight}px` }}>
              <div className="absolute inset-x-0" style={{ top: `${rowTop}px`, height: `${thisRowHeight}px` }}>
                <div className="h-full flex items-center px-3 gap-2">
                  {isTask && subtasksCount > 0 ? (
                    <button onClick={() => onToggleTask(item.id)} className="p-1 rounded hover:bg-gray-100 text-gray-600" aria-label={expanded ? 'Collapse' : 'Expand'}>
                      <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <span className="w-6" />
                  )}
                  <button
                    onClick={() => handleClick(item)}
                    className={`${isSubtask ? 'text-[11px]' : 'text-sm'} text-gray-800 font-medium truncate text-left flex-1 hover:underline ${isTask ? 'pl-1' : ''} ${isSubtask && parentExpanded ? 'pl-6' : ''}`}
                    title={item.title}
                  >
                    {item.title}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


