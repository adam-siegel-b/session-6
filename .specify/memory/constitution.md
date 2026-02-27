<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (amendment: branch naming)

Modified principles:
  - Development Workflow §1: expanded to allow SpecKit `###-short-name`
    pattern alongside the existing `feature/<short-description>` format.
    Resolves analysis finding C1 (CRITICAL — constitution MUST violation
    caused by SpecKit-generated branch `001-overdue-todos`).

Added sections:
  - None

Removed sections:
  - None

Templates reviewed and status:
  - .specify/templates/plan-template.md    ✅ no change needed
  - .specify/templates/spec-template.md    ✅ no change needed
  - .specify/templates/tasks-template.md   ✅ no change needed

Follow-up TODOs:
  - None; C1 fully resolved.
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Clean Code & Consistent Style

All code MUST follow the formatting and naming conventions defined in
`docs/coding-guidelines.md`. Non-negotiable rules:

- **Indentation**: 2 spaces everywhere (JS, JSON, CSS, Markdown).
- **Naming**: `camelCase` for variables/functions; `PascalCase` for
  React components and classes; `UPPER_SNAKE_CASE` for constants.
- **Imports**: Ordered external → internal → styles, separated by blank
  lines. No circular imports.
- **Line length**: MUST stay under 100 characters for code.
- **DRY**: Repeated logic MUST be extracted into shared utilities or
  components before merging.
- **KISS**: Prefer the simplest correct implementation. Premature
  optimization is prohibited without profiling evidence.
- **SOLID**: Each module/component MUST have a single, well-defined
  responsibility. Prop interfaces MUST be minimal and focused.
- **Error handling**: Every async operation MUST include try/catch with
  a meaningful user-facing error message.
- **Linting**: All linting errors MUST be resolved before opening a PR.
  No `console.log` statements may remain in production code.

*Rationale*: Consistent style reduces cognitive load, speeds up review,
and prevents common runtime errors across a team-developed codebase.

### II. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before or alongside implementation — never after.

- **Minimum coverage**: 80% across all packages; 100% on critical user
  workflows (create, read, update, delete a todo).
- **Red-Green-Refactor**: New functionality MUST begin with a failing
  test. Implementation proceeds only to make the test pass.
- **Test isolation**: Each test MUST set up its own data, mock all
  external dependencies (API calls, timers), and clean up afterward.
  No shared mutable state between tests.
- **Test types required**: Unit tests for every component/function;
  integration tests for component interactions and API communication.
  End-to-end tests are out of scope for initial development.
- **Naming**: Test files MUST be named `{filename}.test.js` and
  co-located in `__tests__/` sibling directories.
- **Structure**: Follow Arrange-Act-Assert (AAA) within each test.
- **Coverage gate**: A PR that drops overall coverage below 80% MUST
  NOT be merged.

*Rationale*: TDD produces more reliable software and serves as living
documentation of expected behavior.

### III. UI Consistency & Accessibility

All UI work MUST conform to the design system defined in
`docs/ui-guidelines.md`.

- **Design system**: Material Design-inspired with a Halloween theme.
  Deviations require explicit justification in the PR description.
- **Color tokens**: Only the defined light/dark mode palette tokens may
  be used. No ad hoc hex values outside the defined palette.
- **Spacing**: MUST follow the 8px grid (`xs`=8px, `sm`=16px,
  `md`=24px, `lg`=32px, `xl`=48px).
- **Typography**: MUST use the defined scale (28px heading, 18px
  subheading, 16px body, 12px caption, 14px button).
- **Dark/Light mode**: Toggle MUST persist preference in `localStorage`
  and default to the system preference on first visit.
- **Accessibility**: All interactive elements MUST be keyboard
  accessible. Color contrast MUST meet WCAG AA. Icon buttons MUST
  have descriptive `aria-label` or `title` attributes.
- **Layout**: Maximum width MUST be 600px, centered on desktop.

*Rationale*: A coherent design system accelerates development,
eliminates guesswork, and ensures an inclusive experience.

### IV. Scope Discipline & Feature Simplicity

The application MUST remain a scoped single-user todo manager as
defined in `docs/functional-requirements.md`. No out-of-scope
capability may be introduced without an updated requirements document
ratified by the team.

Explicitly prohibited without re-ratification:

- User authentication or multi-user support.
- Priority levels, categories, tags, or labels.
- Filtering, searching, or sorting by any attribute.
- Bulk operations, undo/redo, recurring todos, reminders.
- Mobile-specific optimization beyond basic responsiveness.

YAGNI (You Aren't Gonna Need It) applies universally: features not
currently required MUST NOT be implemented in anticipation of future
need.

*Rationale*: Scope creep is the primary cause of delayed delivery and
technical debt. Explicit boundaries protect project velocity.

### V. Modular Monorepo Architecture

The project MUST maintain the monorepo structure managed via npm
workspaces with a strict separation between `packages/frontend` and
`packages/backend`.

- Frontend MUST be a React application. All UI logic lives in
  `packages/frontend/src/`.
- Backend MUST be an Express.js REST API. All server logic lives in
  `packages/backend/src/`.
- Shared logic MUST NOT be silently duplicated across packages; a
  shared utility MUST be placed in a clearly named shared location.
- Each package MUST be independently testable via its own `npm test`
  script.
- File organization MUST follow the canonical structure in
  `docs/coding-guidelines.md` (`components/`, `services/`,
  `__tests__/`, etc.).

*Rationale*: Clear architectural boundaries make the codebase
navigable, enable parallel work, and prevent tight coupling between
the frontend and backend layers.

## Technology Stack Constraints

The following technology choices are non-negotiable for this project:

| Layer              | Technology                   | Version          |
|--------------------|------------------------------|------------------|
| Frontend           | React                        | per package.json |
| Backend            | Node.js + Express.js         | Node ≥ 16, npm ≥ 7 |
| Testing (both)     | Jest                         | per package.json |
| Frontend testing   | @testing-library/react       | per package.json |
| Package management | npm workspaces               | npm ≥ 7          |

No additional runtime frameworks or state management libraries may be
introduced without a constitution amendment.

*Reference*: `docs/project-overview.md`, root `package.json`.

## Development Workflow

All contributors MUST follow this workflow:

1. **Feature branches**: All work MUST occur on a dedicated branch off `main`.
   Two naming conventions are accepted:
   - **SpecKit-managed features**: `###-short-name` (e.g., `001-overdue-todos`),
     as generated by the `/speckit.specify` command.
   - **Ad-hoc work**: `feature/<short-description>` (e.g.,
     `feature/fix-date-formatting`).
   The SpecKit convention takes precedence when SpecKit tooling is in use.
2. **Atomic commits**: Each commit MUST represent a single logical
   change. Commit messages MUST use Conventional Commits format:
   `<type>: <imperative description>`
   (e.g., `feat: add due date picker to todo form`).
3. **Linting before commit**: `npm run lint` MUST pass with zero errors.
   Use pre-commit hooks to enforce this locally.
4. **Tests before merge**: `npm test` from the root MUST pass and
   coverage MUST remain at or above 80%.
5. **Pull Requests**: Every change to `main` MUST go through a PR and
   MUST reference the relevant spec or issue.
6. **Code review checklist**: naming conventions, import order, DRY,
   SRP, error handling, meaningful comments, test coverage, no leftover
   `console.log` statements.

## Governance

This constitution supersedes all other ad hoc practices. Where a
conflict exists between this document and any other guideline, the
constitution prevails unless the conflicting document has been ratified
as a formal amendment.

**Amendment procedure**:
1. Author proposes a change with written rationale in a PR.
2. At least one other contributor MUST approve the amendment.
3. `CONSTITUTION_VERSION` MUST be bumped per semantic versioning:
   - **MAJOR**: removal or incompatible redefinition of a principle.
   - **MINOR**: new principle or section added / materially expanded.
   - **PATCH**: clarifications, wording fixes, non-semantic refinements.
4. `LAST_AMENDED_DATE` MUST be updated to the merge date (ISO format).
5. All dependent templates under `.specify/templates/` MUST be reviewed
   and updated in the same PR if impacted.

**Compliance review**: The Constitution Check gate in every
`plan-template.md` MUST be evaluated before implementation begins on
any feature. Violations MUST be resolved or formally exempted in the
plan's Complexity Tracking section.

**Version**: 1.1.0 | **Ratified**: 2026-02-27 | **Last Amended**: 2026-02-27
