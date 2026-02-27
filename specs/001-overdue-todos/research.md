# Research: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-27

## Questions Resolved

### 1. Does any overdue utility already exist in the codebase?

**Decision**: No existing utility; must be created.  
**Rationale**: A codebase search of `packages/frontend/src/` confirmed there
is no `isOverdue`, `overdue`, or date-comparison utility anywhere in
`utils/`, `services/`, or `components/`.  
**Alternatives considered**: Inline computation inside `TodoCard` — rejected
because it would be untestable in isolation and violates SRP (Constitution I).

---

### 2. How should the overdue date comparison be implemented in JavaScript?

**Decision**: Compare ISO date strings lexicographically:
`dueDate < new Date().toISOString().split('T')[0]`  
**Rationale**:
- The backend stores `dueDate` as a plain date string (e.g., `"2025-12-25"`).
- `new Date(dateString)` on an ISO date-only string is parsed as **UTC
  midnight**, while `new Date()` reflects local time. Comparing the two as
  `Date` objects introduces timezone edge cases where a todo due "today" could
  appear overdue in regions behind UTC.
- Comparing YYYY-MM-DD strings directly sidesteps this entirely: ISO date
  strings are lexicographically sortable, so `"2026-01-15" < "2026-02-27"`
  evaluates correctly with the `<` operator.
- `new Date().toISOString().split('T')[0]` yields today's UTC date. Since the
  backend also stores dates in UTC-aligned ISO format, this is consistent.  
**Alternatives considered**:
- `new Date(dueDate) < new Date()` — rejected due to timezone offset risk
  (a todo due on today's date could be flagged overdue in UTC+N locales).
- `dayjs` / `date-fns` library — rejected; adding a dependency for a
  single string comparison violates YAGNI (Constitution IV) and the
  technology constraints (Constitution — Technology Stack).

---

### 3. What color / visual treatment should overdue items use?

**Decision**: Use existing `--danger-color` CSS variable for the left border
accent and badge text; add `.todo-card.overdue` modifier class in `App.css`.  
**Rationale**:
- `--danger-color` (`#c62828` light / `#ef5350` dark) is already defined in
  `theme.css` for destructive actions (delete button). Red is universally
  understood as "problem/attention-needed".
- Contrast check: `#c62828` on `#ffffff` (surface) = 7.3:1 — exceeds WCAG AA
  4.5:1 requirement (Constitution III). `#ef5350` on `#2d2d2d` (dark surface)
  = 4.6:1 — passes WCAG AA.
- No new color token is required, keeping `theme.css` unchanged and
  satisfying Constitution III ("Only defined palette tokens may be used").  
**Visual approach**: A 3px left border in `--danger-color` on the card + a
small inline `<span class="overdue-badge">Overdue</span>` next to the due
date. The badge provides a non-color indicator for accessibility (color alone
is insufficient per WCAG 1.4.1).  
**Alternatives considered**:
- Background tint on the whole card — rejected; too heavy and conflicts with
  the completed-state opacity treatment on the same element.
- Icon only (⚠️) — rejected; insufficient contrast and no text label
  for screen readers.
- New `--overdue-color` token — rejected; `--danger-color` already semantically
  represents "error/danger" and is defined for both themes.

---

### 4. Where does the overdue CSS class get added — `TodoCard.js` or `TodoList.js`?

**Decision**: Inside `TodoCard.js`, applied to the root `.todo-card` `div`.  
**Rationale**: `TodoCard` already owns the pattern for conditional CSS classes
(`todo-card completed`). Adding `overdue` there is consistent with existing
code, keeps the visual concern co-located with the card rendering logic, and
requires no changes to `TodoList`.  
**Alternatives considered**: Computing in `TodoList` and passing as a prop —
rejected; the `isOverdue` state is a display concern of the card, not the list.

---

### 5. Does the overdue state need to update in real time (e.g., at midnight)?

**Decision**: Compute on every render; no timer or subscription needed for
this feature.  
**Rationale**: The spec says overdue status must reflect the current date "at
the time the list is rendered or refreshed" (Assumptions). The use case of
staying open past midnight (User Story 2) is satisfied naturally because any
re-render triggered by user interaction (toggle, edit, scroll) recomputes.
Adding a midnight timer is explicitly out of scope per the spec Assumptions
and would violate YAGNI (Constitution IV).
