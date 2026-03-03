import { isOverdue } from '../isOverdue';

describe('isOverdue utility', () => {
  // Fix today to a deterministic date for all truth-table tests
  const TODAY = new Date('2026-02-27T00:00:00');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Truth-table row 1: null dueDate → false
  it('returns false when dueDate is null', () => {
    expect(isOverdue(null, 0)).toBe(false);
  });

  // Truth-table row 2: past dueDate + incomplete → true
  it('returns true for a past due date with an incomplete todo', () => {
    expect(isOverdue('2026-02-26', 0)).toBe(true);
  });

  // Truth-table row 3: today's date + incomplete → false (boundary: due today ≠ late)
  it('returns false when due date is today (boundary case)', () => {
    expect(isOverdue('2026-02-27', 0)).toBe(false);
  });

  // Truth-table row 4: future dueDate + incomplete → false
  it('returns false when due date is in the future', () => {
    expect(isOverdue('2026-02-28', 0)).toBe(false);
  });

  // Truth-table row 5: past dueDate + complete → false
  it('returns false when todo is completed even if past due', () => {
    expect(isOverdue('2026-02-26', 1)).toBe(false);
  });

  // Truth-table row 6: confirm completed=1 never overdue regardless of date
  it('returns false for any date when completed is 1', () => {
    expect(isOverdue('2020-01-01', 1)).toBe(false);
    expect(isOverdue('2026-02-27', 1)).toBe(false);
    expect(isOverdue('2099-12-31', 1)).toBe(false);
  });

  // T007 — US2: Date freshness — verify computation uses live clock, not a cached value
  it('US2: computes overdue against the live clock on each call', () => {
    // At "today" (2026-02-27), yesterday is overdue
    expect(isOverdue('2026-02-26', 0)).toBe(true);
    expect(isOverdue('2026-02-27', 0)).toBe(false);

    // Advance clock by 1 day to 2026-02-28
    jest.setSystemTime(new Date('2026-02-28T00:00:00'));

    // Now 2026-02-27 (yesterday) is overdue; 2026-02-26 is still overdue
    expect(isOverdue('2026-02-27', 0)).toBe(true);
    expect(isOverdue('2026-02-28', 0)).toBe(false);
  });
});
