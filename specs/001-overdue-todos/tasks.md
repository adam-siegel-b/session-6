# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `specs/001-overdue-todos/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Scope**: Frontend-only feature. `packages/backend/` is untouched.  
**No contracts/ directory**: purely internal UI feature; no public API or library interface exposed.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Create the `utils/` directory structure required by the implementation plan.

- [ ] T001 Create `packages/frontend/src/utils/` and `packages/frontend/src/utils/__tests__/` directories

**Checkpoint**: Directories exist — foundational work can begin.

---

## Phase 2: Foundational — `isOverdue` Utility

**Purpose**: The `isOverdue` pure function is the single dependency for all three user
stories. It must exist and be tested before any component or style work begins.

**⚠️ CRITICAL**: Follow Red-Green-Refactor. Write tests (T002) first — they MUST FAIL —
then implement (T003) to make them pass.

- [ ] T002 Write unit tests covering all 6 truth-table rows in `packages/frontend/src/utils/__tests__/isOverdue.test.js`
  - null dueDate → false
  - past dueDate + incomplete → true
  - today's date + incomplete → false (boundary)
  - future dueDate + incomplete → false
  - past dueDate + complete → false
  - all cases with `completed = 1` → false
- [ ] T003 Implement `isOverdue(dueDate, completed)` in `packages/frontend/src/utils/isOverdue.js` (ISO string comparison per data-model.md; make T002 tests pass)

**Checkpoint**: `isOverdue` utility is tested and passing — all user story phases can now proceed.

---

## Phase 3: User Story 1 — Visual Overdue Indicator (Priority: P1) 🎯 MVP

**Goal**: Incomplete todos with a past due date display a red left border and an
"Overdue" badge next to the due date.

**Independent Test**: Load the list with a mix of todos (past due incomplete, past due
complete, future due, no due date). Only past-due incomplete todos show the badge.
Verify in both light and dark mode.

- [ ] T004 [P] [US1] Add `.todo-card.overdue` CSS modifier class (3px left border in `--danger-color`, `.overdue-badge` styles) to `packages/frontend/src/App.css`
- [ ] T005 [US1] Update `packages/frontend/src/components/TodoCard.js` to import `isOverdue`, apply `overdue` CSS class to root `div`, and render `<span className="overdue-badge">Overdue</span>` next to the due date when overdue
- [ ] T006 [US1] Add overdue visual indicator test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`
  - overdue todo has class `overdue` on `.todo-card`
  - overdue todo renders "Overdue" badge
  - completed past-due todo does NOT have class `overdue`
  - future-due incomplete todo does NOT have class `overdue`
  - no-due-date todo does NOT have class `overdue`

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 — Date Freshness Validation (Priority: P2)

**Goal**: Verify that `isOverdue` computes against the live clock on every call, not
a cached value. No new implementation code — US2 is satisfied by `new Date()` being
called inside the utility on each invocation.

**Independent Test**: Mock `Date` in the test to control "today", verify a todo whose
`dueDate` equals `today - 1 day` is overdue and one whose `dueDate` equals `today` is not.

- [ ] T007 [US2] Add dynamic date computation test to `packages/frontend/src/utils/__tests__/isOverdue.test.js` — use `jest.useFakeTimers` / `jest.setSystemTime` to pin "today" and assert the due-today boundary fires correctly

**Checkpoint**: User Story 2 validated — no implementation change required.

---

## Phase 5: User Story 3 — Interactivity Preserved (Priority: P3)

**Goal**: Confirm that all existing interactions on overdue todos (toggle complete,
edit due date, delete) continue to work and that completing or re-dating an overdue
todo removes its overdue indicator.

**Independent Test**: Simulate a user toggling an overdue todo complete → `overdue`
class disappears. Simulate editing due date to a future value → `overdue` class
disappears.

- [ ] T008 [US3] Add interactivity test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`
  - overdue todo: clicking checkbox calls `onToggle` (baseline interactivity check)
  - overdue todo: edit and delete buttons are present and enabled
  - re-render with `completed: 1` removes the `overdue` class (simulates post-toggle state)
  - re-render with future `dueDate` removes the `overdue` class (simulates post-edit state)

**Checkpoint**: User Story 3 validated — overdue state does not block any interaction.

---

## Final Phase: Polish & Quality Gates

**Purpose**: Verify linting compliance and coverage requirements before PR.

- [ ] T009 Run `npm test --workspace=packages/frontend -- --coverage` and confirm overall coverage ≥ 80%; address any gaps
- [ ] T010 [P] Run `npm run lint` (or `npm run lint:fix`) from `packages/frontend` and resolve all ESLint errors/warnings

---

## Dependency Graph

```
T001 → T002 → T003 → T005 → T006
                    ↗         ↓
               T004          T008
                    
T003 → T007   (US2 tests can run in parallel with Phase 3)

T006, T007, T008 → T009 → T010
```

US2 (T007) and the CSS task (T004) can run in parallel with the TodoCard
implementation (T005) since they touch different files.

## Parallel Execution

Within Phase 3:
- T004 (App.css) and T007 (isOverdue.test.js US2 boundary) can proceed
  simultaneously with T005/T006 work once T003 is done.

Within the final phase:
- T009 (test coverage) and T010 (lint) can run simultaneously once T008 passes.

## Implementation Strategy

**MVP** = Phase 1 + Phase 2 + Phase 3 (T001–T006): delivers the full core value
of User Story 1 independently.

Phases 4 and 5 add test coverage for US2 and US3 edge cases but introduce no
new production code — they can be stacked on top of the MVP commit.

**Suggested commit sequence**:
1. `test: add isOverdue unit tests (failing)` — T002
2. `feat: implement isOverdue utility` — T003
3. `feat: add overdue CSS styles` — T004
4. `feat: apply overdue indicator in TodoCard` — T005
5. `test: add TodoCard overdue tests` — T006
6. `test: add isOverdue date freshness boundary test` — T007
7. `test: add TodoCard interactivity tests for overdue state` — T008
