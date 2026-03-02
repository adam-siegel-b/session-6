# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

## Summary

Visually distinguish incomplete todos whose due date falls before today's calendar date.
The overdue state is a **derived, display-only property** — computed in the `TodoCard`
component by comparing `todo.dueDate` to the current date at render time. No backend
changes are required; the existing `dueDate` and `completed` fields on each todo object
are sufficient.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 18  
**Primary Dependencies**: React, @testing-library/react, Jest, msw  
**Storage**: N/A (overdue is not persisted; computed on the client)  
**Testing**: Jest + @testing-library/react (`npm test` in `packages/frontend`)  
**Target Platform**: Browser (React SPA served via Express in development)  
**Project Type**: Web application (monorepo — `packages/frontend` + `packages/backend`)  
**Performance Goals**: No measurable impact; single date comparison per todo card  
**Constraints**: Must respect existing 8px grid, color token system, and WCAG AA contrast  
**Scale/Scope**: Single todo list view; no new views, routes, or backend endpoints

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code & Consistent Style | ✅ Pass | camelCase, 2-space indent, <100-char lines, no `console.log` |
| II. Test-First Development | ✅ Pass | New tests cover all FR-001–FR-008 scenarios before implementation |
| III. UI Consistency & Accessibility | ✅ Pass | Uses defined color tokens; `aria-label` on overdue indicator |
| IV. Scope Discipline | ✅ Pass | No filtering, notifications, grouping, or server-side logic |
| V. Modular Monorepo Architecture | ✅ Pass | All changes confined to `packages/frontend` |

**No violations** — no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── spec.md                   # Feature specification
├── checklists/
│   └── requirements.md       # Specification quality checklist
└── plan.md                   # This file
```

### Source Code (changes for this feature)

```text
packages/frontend/
├── src/
│   ├── components/
│   │   ├── TodoCard.js               # MODIFY — compute isOverdue, apply CSS class + label
│   │   └── __tests__/
│   │       └── TodoCard.test.js      # MODIFY — add overdue scenarios (FR-001–FR-008)
│   ├── App.css                       # MODIFY — add .todo-card.overdue styles
│   └── styles/
│       └── theme.css                 # MODIFY — add --overdue-color token (light + dark)
```

No backend files require modification. No new files are introduced.

**Structure Decision**: Web application layout (Option 2 from template). All changes are
scoped to `packages/frontend` because overdue status is a front-end, display-only concern
as documented in the spec's Assumptions section.

## Implementation Phases

### Phase 0 — Research

*No external API or library research required.* The feature uses only:

- JavaScript's built-in `Date` object for `today` (midnight, local time).
- Existing `todo.dueDate` (ISO date string, e.g. `"2026-02-20"`) and `todo.completed`
  (integer `0`/`1`) fields already present in every todo response.
- Existing CSS class pattern `.todo-card.completed` as the direct model for
  `.todo-card.overdue`.

Boundary rule confirmed from spec: a todo due **today** is **not** overdue; it becomes
overdue starting the calendar day after its due date.

### Phase 1 — Design

#### Overdue Predicate

```
isOverdue(todo):
  if todo.completed !== 0   → false
  if todo.dueDate is null   → false
  today = local calendar date (midnight, e.g. "2026-02-27")
  dueDay = calendar date of todo.dueDate
  return dueDay < today
```

Implementation as a pure utility function in `TodoCard.js` (no shared utility needed;
single call site, KISS principle):

```js
// Inside TodoCard.js — no import needed
const today = new Date();
today.setHours(0, 0, 0, 0);
const due = new Date(dueDate + 'T00:00:00');  // force local midnight, avoid UTC shift
const isOverdue = !todo.completed && todo.dueDate && due < today;
```

Appending `'T00:00:00'` to the date string ensures `new Date()` parses it as **local
midnight** rather than UTC midnight, which would cause an off-by-one error for users
west of UTC.

#### CSS Token & Styles

New token in `theme.css`:

```css
/* Light mode */
--overdue-color: #b71c1c;   /* deep red — distinct from --danger-color (#c62828) */

/* Dark mode */
--overdue-color: #ef9a9a;   /* soft red on dark surface — WCAG AA on #2d2d2d */
```

New rules in `App.css` (after the `.todo-card.completed` block):

```css
.todo-card.overdue {
  border-left: 4px solid var(--overdue-color);
}

.todo-card.overdue .todo-title {
  color: var(--overdue-color);
}

.todo-due-date.overdue-date {
  color: var(--overdue-color);
  font-weight: 600;
}

.overdue-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--overdue-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}
```

#### TodoCard.js Changes

1. Compute `isOverdue` from `todo.dueDate` and `todo.completed` at render time.
2. Apply `overdue` CSS class to the card root `<div>` when `isOverdue` is `true`.
3. Add `aria-label` / visually-hidden `"Overdue"` badge inside `.todo-content` for
   screen-reader accessibility (FR-008 — remains fully interactive).
4. Apply `overdue-date` class to the due-date `<p>` when `isOverdue` is `true`.
5. No other component, service, or route is modified.

#### Acceptance Scenario Mapping

| FR | Scenario | Verified By |
|----|----------|-------------|
| FR-001 | Incomplete + past due → overdue class applied | `TodoCard.test.js` |
| FR-002 | Computed at render, no user action needed | N/A (architectural) |
| FR-003 | Due today → NOT overdue | `TodoCard.test.js` |
| FR-004 | Completed + past due → NOT overdue | `TodoCard.test.js` |
| FR-005 | No due date → NOT overdue | `TodoCard.test.js` |
| FR-006 | Mark complete → overdue class removed | `App.test.js` (toggle flow) |
| FR-007 | Edit due date to future → overdue class removed | `TodoCard.test.js` |
| FR-008 | Overdue todo: edit/complete/delete all work | `TodoCard.test.js` |

### Phase 2 — Implementation Order

1. **`theme.css`** — add `--overdue-color` token for light and dark themes.
2. **`App.css`** — add `.todo-card.overdue`, `.todo-due-date.overdue-date`, and
   `.overdue-badge` style rules.
3. **`TodoCard.test.js`** — add failing tests for all overdue scenarios (TDD: red).
4. **`TodoCard.js`** — implement `isOverdue` computation and apply class/badge (green).
5. **Verify tests pass** — `npm test --workspace=packages/frontend`.
6. **Lint** — `npm run lint` from the root; resolve any issues.
