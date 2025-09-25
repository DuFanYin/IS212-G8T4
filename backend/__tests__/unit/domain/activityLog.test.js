const ActivityLog = require('../../../src/domain/ActivityLog');

describe('Domain: ActivityLog', () => {
  const now = new Date();
  const base = {
    id: 'a1',
    userId: 'u1',
    action: 'CREATE_TASK',
    details: { foo: 'bar' },
    resourceType: 'task',
    resourceId: 't1',
    timestamp: now.toISOString(),
  };

  it('isRecent within configurable minutes', () => {
    const log = new ActivityLog({ ...base, timestamp: new Date(Date.now() - 60 * 1000).toISOString() });
    expect(log.isRecent(5)).toBe(true);
    const old = new ActivityLog({ ...base, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() });
    expect(old.isRecent(5)).toBe(false);
  });

  it('isToday and isThisWeek reflect timestamp', () => {
    const today = new ActivityLog({ ...base, timestamp: now.toISOString() });
    expect(today.isToday()).toBe(true);
    expect(today.isThisWeek()).toBe(true);
  });
});


