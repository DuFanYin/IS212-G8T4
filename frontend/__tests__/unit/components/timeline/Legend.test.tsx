import { render, screen } from '@testing-library/react';
import { Legend } from '@/components/timeline/Legend';

describe('Legend', () => {
  it('renders legend component', () => {
    render(<Legend />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows task status legend items', () => {
    render(<Legend />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders status indicators', () => {
    render(<Legend />);
    const indicators = screen.getAllByRole('generic');
    expect(indicators.length).toBeGreaterThan(0);
  });
});
