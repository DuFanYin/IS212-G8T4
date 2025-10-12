import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TimelineGrid } from '@/components/timeline/TimelineGrid';

// Mock timeline utils
vi.mock('@/lib/utils/timeline', () => ({
  getItemDates: vi.fn().mockReturnValue({
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  })
}));

describe('TimelineGrid', () => {
  const defaultProps = {
    rows: [],
    rowHeights: [],
    rowOffsets: [],
    totalHeight: 100,
    dateHeaderLabels: [],
    todayLinePosition: 50,
    verticalGridLines: [],
    projectSpans: new Map(),
    timelineBounds: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31')
    },
    handleClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timeline grid', () => {
    render(<TimelineGrid {...defaultProps} />);
    expect(screen.getByTestId('timeline-grid')).toBeInTheDocument();
  });

  it('renders with empty rows', () => {
    render(<TimelineGrid {...defaultProps} rows={[]} />);
    expect(screen.getByTestId('timeline-grid')).toBeInTheDocument();
  });

  it('handles task rows', () => {
    const propsWithTask = {
      ...defaultProps,
      rows: [{
        type: 'task' as const,
        item: {
          id: 'task-1',
          type: 'task' as const,
          title: 'Test Task',
          dueDate: '2024-01-15',
          createdAt: '2024-01-01',
          status: 'ongoing'
        }
      }],
      rowHeights: [20],
      rowOffsets: [0]
    };
    render(<TimelineGrid {...propsWithTask} />);
    expect(screen.getByTestId('timeline-grid')).toBeInTheDocument();
  });
});
