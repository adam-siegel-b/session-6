# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify Overdue Todos at a Glance (Priority: P1)

As a user reviewing my todo list, I want overdue items to stand out visually
so that I can immediately see which tasks are past their due date without
manually comparing dates.

**Why this priority**: This is the core value of the feature. Without it,
users must mentally calculate which items are late every time they view the
list — a friction that undermines the usefulness of due dates entirely.

**Independent Test**: Can be fully tested by loading the todo list with a mix
of todos (some with past due dates and incomplete, some with future due dates,
some with no due date, some completed with past due dates) and verifying that
only the incomplete past-due items receive the overdue visual treatment.

**Acceptance Scenarios**:

1. **Given** a todo with a due date in the past and a status of incomplete,
   **When** the user views the todo list,
   **Then** that todo is visually distinguished from non-overdue todos (e.g.,
   different color, label, or indicator).

2. **Given** a todo with a due date in the past and a status of complete,
   **When** the user views the todo list,
   **Then** that todo is NOT shown with the overdue visual treatment.

3. **Given** a todo with a due date in the future and a status of incomplete,
   **When** the user views the todo list,
   **Then** that todo is NOT shown with the overdue visual treatment.

4. **Given** a todo with no due date and a status of incomplete,
   **When** the user views the todo list,
   **Then** that todo is NOT shown with the overdue visual treatment.

---

### User Story 2 - Overdue Status Reflects Current Date Without Refresh (Priority: P2)

As a user who leaves the app open across midnight, I want the overdue status
of todos to reflect the actual current date at the time I am looking at the
list, so I never see stale or incorrect overdue indicators.

**Why this priority**: If the overdue calculation is stale, users could be
misled into ignoring actual overdue items or be confused by incorrectly
flagged items. This supports the integrity of P1.

**Independent Test**: Can be verified by observing that a todo whose due date
is today (not yet overdue) transitions to the overdue visual state the
following day without requiring a manual page reload.

**Acceptance Scenarios**:

1. **Given** a todo whose due date is today,
   **When** the user views the todo list,
   **Then** that todo is NOT shown as overdue (due today is not yet late).

2. **Given** a todo whose due date was yesterday,
   **When** the user views the todo list on the current day,
   **Then** that todo IS shown as overdue.

---

### User Story 3 - Overdue Items Remain Fully Interactive (Priority: P3)

As a user with overdue todos, I want to still be able to complete, edit, or
delete them just like any other todo, so that the overdue state doesn't block
me from managing my list.

**Why this priority**: User Story 1 provides the visibility; this story
ensures the overdue visual treatment does not accidentally remove
interactivity, which would degrade the baseline todo experience.

**Independent Test**: Can be verified by selecting an overdue todo and
confirming that the complete, edit, and delete actions all work as expected,
and that marking it complete removes the overdue indicator.

**Acceptance Scenarios**:

1. **Given** an overdue todo is displayed,
   **When** the user marks it as complete,
   **Then** the overdue visual treatment is removed and the todo is shown as
   completed.

2. **Given** an overdue todo is displayed,
   **When** the user edits its due date to a future date,
   **Then** the overdue visual treatment is removed.

3. **Given** an overdue todo is displayed,
   **When** the user deletes it,
   **Then** the todo is removed from the list.

---

### Edge Cases

- **No due date set**: A todo without a due date can never be overdue, regardless
  of when it was created or how long it has been incomplete.
- **Due date is today**: A todo due today is NOT overdue. It becomes overdue
  starting the day after its due date.
- **Todo completed after due date**: Once a todo is marked complete, it MUST NOT
  display as overdue, even if the completion date was after the due date.
- **All todos have no due dates**: The list renders normally with no overdue
  indicators; no empty states or messages about overdue items are shown.
- **User edits a past due date to a future date**: The overdue indicator
  disappears immediately upon saving the edit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST visually distinguish any todo that is both
  incomplete AND has a due date that falls before the current calendar date.
- **FR-002**: The system MUST determine overdue status automatically based on
  the current date; no user action is required to trigger or refresh it.
- **FR-003**: A todo due on the current calendar day MUST NOT be treated as
  overdue.
- **FR-004**: A completed todo MUST NOT display an overdue indicator,
  regardless of whether its due date has passed.
- **FR-005**: A todo with no due date MUST NOT display an overdue indicator.
- **FR-006**: The overdue visual treatment MUST be removed immediately when a
  user marks an overdue todo as complete.
- **FR-007**: The overdue visual treatment MUST be removed immediately when a
  user updates an overdue todo's due date to a current or future date.
- **FR-008**: Overdue todos MUST remain fully interactive: they can be marked
  complete, edited, and deleted using the same controls as non-overdue todos.

### Key Entities

- **Todo Item**: Represents a task with a title, optional due date, completion
  status, and creation date. The overdue state is a derived, display-only
  property computed from the due date and current date — it is NOT stored
  as a separate field.
- **Overdue State**: A boolean condition derived by comparing a todo's due date
  to today's date. True when: `due date exists` AND `due date < today` AND
  `completed = false`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue todos in the list without reading
  or mentally comparing individual date values.
- **SC-002**: The overdue visual treatment is distinct from both the normal
  (non-overdue, incomplete) and completed states such that a new user can
  distinguish all three states without instruction.
- **SC-003**: Zero overdue indicators appear on completed todos or todos
  without due dates, across all test scenarios.
- **SC-004**: Marking an overdue todo as complete removes its overdue
  indicator in the same interaction, with no additional steps required.
- **SC-005**: The overdue determination requires no user action beyond
  opening or viewing the todo list.

## Assumptions

- "Current date" is determined by the device/browser clock at the time the
  list is rendered or refreshed; no server-side time synchronization is
  required for this feature.
- Overdue status is a front-end, display-only concern. The backend does not
  need a dedicated overdue field or endpoint — existing todo data (due date +
  completion status) is sufficient.
- The feature applies to the existing single todo list view; no new views,
  filters, or groupings are introduced.
- Timezone handling follows whatever the existing date picker behavior uses;
  no timezone normalization is in scope for this feature.

## Out of Scope

- Filtering or sorting the list to show overdue items first or in isolation.
- Notifications, alerts, or reminders triggered by overdue status.
- A separate "overdue" section or grouping within the list.
- Counting or summarizing overdue items in a header or badge.
- Server-side computation or persistence of overdue state.

