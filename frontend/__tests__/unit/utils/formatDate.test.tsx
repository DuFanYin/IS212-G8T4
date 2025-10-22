import { formatDate } from '@/lib/utils/formatDate';

describe('Date Formatting Utils', () => {
  it('formats date correctly', () => {
    const formatted = formatDate('2024-01-15T14:30:00.000Z');
    expect(formatted).toMatch(/Jan, 15, 2024/);
  });

  it('handles invalid date', () => {
    const formatted = formatDate('invalid');
    expect(formatted).toContain('Invalid');
  });

  it('handles empty string', () => {
    const formatted = formatDate('');
    expect(formatted).toContain('Invalid');
  });
});
