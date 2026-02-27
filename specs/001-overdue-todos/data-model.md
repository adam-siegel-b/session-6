# Data Model: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-27

## Overview

This feature introduces **no new persistent data entities** and requires **no
backend schema changes**. The overdue state is a **derived, display-only
property** of the existing `Todo` entity, computed entirely on the frontend.

---

## Existing Entity: Todo

The backend returns todos in this shape (unchanged by this feature):

```javascript
{
  id: number,           // Auto-increment primary key
  title: string,        // Max 255 characters, required
  dueDate: string|null, // ISO date string "YYYY-MM-DD", optional
  completed: 0|1,       // Integer boolean (SQLite convention)
  createdAt: string     // ISO datetime string
}
```

*No fields are added, removed, or modified.*

---

## Derived Property: Overdue State

```
isOverdue(todo) =
  todo.dueDate !== null
  AND todo.dueDate < todayISO          // string comparison: "YYYY-MM-DD"
  AND todo.completed === 0             // integer 0 = incomplete
```

Where `todayISO = new Date().toISOString().split('T')[0]`

### Truth table

| dueDate      | completed | todayISO     | isOverdue |
|--------------|-----------|--------------|-----------|
| null         | 0         | any          | false     |
| "2026-02-26" | 0         | "2026-02-27" | **true**  |
| "2026-02-27" | 0         | "2026-02-27" | false     |
| "2026-02-28" | 0         | "2026-02-27" | false     |
| "2026-02-26" | 1         | "2026-02-27" | false     |
| "2026-02-26" | 0         | "2026-02-26" | false     |

Key rule: `dueDate === todayISO` → **not overdue** (due today ≠ late).

---

## New Frontend Utility

This is the only new "model-like" artefact introduced by the feature:

**File**: `packages/frontend/src/utils/isOverdue.js`

```javascript
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
```

### Validation rules encoded in the utility

| Rule | Encoded as |
|------|-----------|
| No due date → never overdue | `!dueDate → return false` |
| Completed → never overdue | `completed → return false` |
| Due today → not overdue | `<` (strict less-than, not `<=`) |
| Past due date + incomplete → overdue | `dueDate < todayISO` |

---

## State Transitions

The overdue indicator automatically transitions as the user interacts:

```
[incomplete + past due] ──mark complete──► [complete] (overdue indicator removed)
[incomplete + past due] ──edit due date─► [incomplete + future/today due] (removed)
[incomplete + past due] ──delete       ──► (todo removed entirely)
```

All transitions are driven solely by changes to the existing `dueDate` and
`completed` fields — no new state management is needed.
