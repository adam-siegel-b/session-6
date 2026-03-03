/**
 * Determines whether a todo item is overdue.
 *
 * A todo is overdue when:
 *   - it has a due date
 *   - the due date is strictly before today's date
 *   - it is not completed
 *
 * @param {string|null} dueDate - ISO date string "YYYY-MM-DD" or null
 * @param {number} completed    - 0 (incomplete) or 1 (complete)
 * @returns {boolean}
 */
export function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  const todayISO = new Date().toISOString().split('T')[0];
  return dueDate < todayISO;
}
