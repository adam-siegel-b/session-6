# Quickstart: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-27

## Prerequisites

- Node.js ≥ 16 and npm ≥ 7 installed
- Repository cloned and `npm install` run from the root

## Running the App

```bash
# From repository root — starts both frontend and backend
npm run start
```

The frontend is served at **http://localhost:3000** and proxies API calls to
the backend at **http://localhost:3030**.

To see overdue items in action, create a todo with a due date in the past (e.g.,
yesterday's date). The card should immediately display the overdue visual
treatment.

## Running Tests

```bash
# All packages
npm test

# Frontend only (where all changes for this feature live)
npm test --workspace=packages/frontend

# Watch mode during development
npm test --workspace=packages/frontend -- --watch

# Coverage report
npm test --workspace=packages/frontend -- --coverage
```

## What to Test Manually

1. **Overdue todo**: Create a todo with a due date of yesterday → card shows
   overdue badge and red left border.
2. **Non-overdue todo**: Create a todo with a due date of tomorrow → no overdue
   indicator.
3. **Due today**: Create a todo with today's date → no overdue indicator.
4. **No due date**: Create a todo without a due date → no overdue indicator.
5. **Mark overdue complete**: Check the checkbox on an overdue todo →
   overdue indicator disappears immediately.
6. **Edit due date**: Click edit on an overdue todo, change due date to a
   future date, save → overdue indicator disappears.
7. **Dark mode**: Toggle dark mode → overdue styling adapts to the dark
   palette (red border/badge uses `--danger-color` dark value `#ef5350`).

## Files Changed by This Feature

| File | Change |
|------|--------|
| `packages/frontend/src/utils/isOverdue.js` | **NEW** — pure overdue utility |
| `packages/frontend/src/utils/__tests__/isOverdue.test.js` | **NEW** — unit tests |
| `packages/frontend/src/components/TodoCard.js` | **MODIFIED** — apply overdue class/badge |
| `packages/frontend/src/components/__tests__/TodoCard.test.js` | **MODIFIED** — overdue cases |
| `packages/frontend/src/App.css` | **MODIFIED** — `.todo-card.overdue` styles |

Backend files: **no changes required**.

## Architecture Note

Overdue status is computed entirely client-side on every render.
`isOverdue(todo.dueDate, todo.completed)` is a pure function with no side
effects — no API calls, no timers, no extra state. The result drives a
conditional CSS class (`overdue`) and a `<span>` badge on the due-date line.
