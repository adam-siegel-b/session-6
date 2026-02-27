# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-02-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

## Summary

Add a visual overdue indicator to the todo list. Any todo that is incomplete
and has a due date strictly before today's calendar date is considered overdue.
Overdue state is a derived, display-only property computed entirely on the
frontend — no backend changes are required. Implementation consists of: a new
pure `isOverdue` utility function, a `.todo-card.overdue` CSS modifier class
using existing design tokens, and a small update to `TodoCard` to apply the
class and surface a visible badge.

## Technical Context

**Language/Version**: JavaScript ES6+, React 18.2.0 (Create React App 5)
**Primary Dependencies**: React, @testing-library/react 14, Jest (via react-scripts)
**Storage**: N/A — overdue is derived from existing `dueDate` (string | null)
  and `completed` (0 | 1) fields already returned by the backend; no backend
  changes, no schema changes
**Testing**: Jest + @testing-library/react (frontend only; backend not impacted)
**Target Platform**: Web browser, desktop-focused (max-width 600px layout)
**Project Type**: Web application — frontend-only feature
**Performance Goals**: Synchronous, pure computation; zero additional API calls
**Constraints**: Must use existing CSS variable tokens from `theme.css`; WCAG AA
  contrast required; no new palette tokens added; no state management library
**Scale/Scope**: Single-user, single-page list view; 1 utility function,
  1 component update, ~2 CSS rule additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Clean Code | `isOverdue` extracted to utility (DRY/SOLID); 2-space indent; camelCase naming | ✅ PASS |
| II. Test-First | Tests for `isOverdue` utility + `TodoCard` overdue cases planned before implementation | ✅ PASS |
| III. UI Consistency | Uses existing `--danger-color` token; respects 8px grid; WCAG AA contrast | ✅ PASS |
| IV. Scope Discipline | No filtering, notifications, grouping, or server state added; YAGNI respected | ✅ PASS |
| V. Monorepo Architecture | Frontend-only; `packages/backend/` untouched; frontend independently testable | ✅ PASS |

**All gates PASS. Proceeding to Phase 0.**

*Post-design re-check: No design decision introduced violations — see research.md
and data-model.md for rationale. Gates remain PASS.*

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md          # This file
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
└── tasks.md         # Phase 2 output (/speckit.tasks — not yet created)
```

*No `contracts/` directory: this is a purely internal frontend UI feature with
no external API endpoints or public library interfaces exposed.*

### Source Code

```text
packages/frontend/
├── src/
│   ├── utils/
│   │   ├── isOverdue.js                   # NEW: pure overdue utility function
│   │   └── __tests__/
│   │       └── isOverdue.test.js          # NEW: unit tests for utility
│   ├── components/
│   │   ├── TodoCard.js                    # MODIFIED: apply overdue class/badge
│   │   └── __tests__/
│   │       └── TodoCard.test.js           # MODIFIED: add overdue test cases
│   ├── App.css                            # MODIFIED: .todo-card.overdue styles
│   └── styles/
│       └── theme.css                      # UNMODIFIED: existing tokens suffice
└── package.json                           # UNMODIFIED

packages/backend/                          # UNMODIFIED (no backend changes)
```

**Structure Decision**: Frontend-only, Option 2 (web app with
`packages/frontend/` + `packages/backend/`). Only `packages/frontend/` is
modified. New utility lives in `packages/frontend/src/utils/` per the canonical
structure in `docs/coding-guidelines.md`. No shared package needed because
overdue logic is UI-layer only.
