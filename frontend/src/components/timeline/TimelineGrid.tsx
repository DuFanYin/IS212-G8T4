import { type ReactNode } from 'react';
import { getItemDates } from '@/lib/utils/timeline';
import type { TimelineItem } from '@/lib/hooks/useTimeline';

export function TimelineGrid(props: {
  rows: Array<{ type: 'project' | 'task' | 'subtask'; item?: TimelineItem; projectName?: string }>;
  rowHeights: number[];
  rowOffsets: number[];
  totalHeight: number;
  dateHeaderLabels: ReactNode[];
  todayLinePosition: number;
  verticalGridLines: ReactNode[];
  projectSpans: Map<string, { start: Date; end: Date }>;
  timelineBounds: { start: Date; end: Date };
  handleClick: (item: TimelineItem) => void;
  STATUS_COLOR?: Record<string, string>;
}) {
  const { rows, rowHeights, rowOffsets, totalHeight, dateHeaderLabels, todayLinePosition, verticalGridLines, projectSpans, timelineBounds, handleClick, STATUS_COLOR = { completed: 'bg-green-500', ongoing: 'bg-blue-500', under_review: 'bg-yellow-500', overdue: 'bg-red-500', default: 'bg-gray-400' } } = props;
  return (
    <div className="relative flex-1 overflow-hidden" data-testid="timeline-grid">
      <div className="h-9 bg-gray-50 relative">
        {dateHeaderLabels}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30" style={{ left: `${todayLinePosition}%` }} />
      </div>
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {verticalGridLines}
        {rows.map((row, index) => (
          <div key={`bg-${index}`} className={`${row.type === 'project' ? 'bg-gray-200' : index % 2 === 0 ? 'bg-gray-50/60' : 'bg-white/60'}`} style={{ position: 'absolute', left: 0, right: 0, top: `${rowOffsets[index]}px`, height: `${rowHeights[index]}px` }} />
        ))}
        {rows.map((row, index) => {
          if (row.type !== 'project') return null;
          const span = projectSpans.get(row.projectName ?? '');
          if (!span) return null;
          const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
          const startMs = span.start.getTime() - timelineBounds.start.getTime();
          const endMs = span.end.getTime() - timelineBounds.start.getTime();
          const left = Math.max(0, (startMs / totalMs) * 100);
          const width = Math.min(100 - left, Math.max(1, ((endMs - startMs) / totalMs) * 100));
          const top = rowOffsets[index] + (rowHeights[index] - 12) / 2;
          return <div key={`proj-span-${index}`} className="absolute bg-gray-700/30 rounded-sm" style={{ left: `${left}%`, width: `${width}%`, top: `${top}px`, height: '12px' }} />;
        })}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30" style={{ left: `${todayLinePosition}%` }} />
        {rows.map((row, index) => {
          if (!row.item || (row.type !== 'task' && row.type !== 'subtask')) return null;
          const item = row.item;
          const totalMs = timelineBounds.end.getTime() - timelineBounds.start.getTime();
          const { start, end } = getItemDates(item.createdAt, item.dueDate);
          const startMs = start.getTime() - timelineBounds.start.getTime();
          const endMs = end.getTime() - timelineBounds.start.getTime();
          const leftPercent = Math.max(0, (startMs / totalMs) * 100);
          const widthPercent = Math.min(100 - leftPercent, Math.max(5, ((endMs - startMs) / totalMs) * 100));
          const barHeight = row.type === 'task' ? 16 : 8;
          const top = rowOffsets[index] + (rowHeights[index] - barHeight) / 2;
          const isOverdue = new Date(item.dueDate) < new Date();
          const isCompleted = item.status === 'completed';
          const colorClass = isCompleted
            ? STATUS_COLOR.completed
            : isOverdue
            ? STATUS_COLOR.overdue
            : item.status === 'ongoing'
            ? STATUS_COLOR.ongoing
            : item.status === 'under_review'
            ? STATUS_COLOR.under_review
            : STATUS_COLOR.default;
          return (
            <div
              key={item.id}
              className={`absolute cursor-pointer z-40 ${colorClass} rounded-sm shadow-sm`}
              style={{ left: `${leftPercent.toFixed(3)}%`, top: `${top}px`, width: `${widthPercent.toFixed(3)}%`, height: `${barHeight}px` }}
              title={`${item.title} ${isOverdue ? '(Overdue)' : ''}`}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
    </div>
  );
}


