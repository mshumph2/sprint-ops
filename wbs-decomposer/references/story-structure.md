# Story Structure and Quality Rules

This reference defines the required story template and quality rules for Phase 4: Story Generation. Every story in the WBS must conform to this structure.

---

## Required Story Template

Every story MUST include all of these fields:

```
### Story N: [Concise Title]

**As a** [specific role], **I want** [specific capability], **so that** [measurable benefit].

**Acceptance Criteria:**
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]

**Scope:**
- `path/to/file.ext` — [specific change description]
- `path/to/directory/` — [specific change description]

**Parallel Assumption:** [Explicit statement of why this story can be implemented independently]
```

---

## Story Quality Rules

1. **Atomic**: One story = one capability. If a story has "and" in the title, split it.
2. **Testable**: Every acceptance criterion must be verifiable without reading the implementation. See the AC Quality Guide below.
3. **Scoped**: Every story must list specific files/modules. "Various files" is not acceptable.
4. **Independent**: The parallel assumption must be a positive statement, not "no dependencies."
5. **Valuable**: Every story must deliver user-visible value. No "set up infrastructure" stories (those go in Phase 0).
6. **AC Count**: Each story should have 3–5 acceptance criteria. Fewer than 3 suggests underspecification. More than 5 suggests the story should be split.

---

## Acceptance Criteria Quality Guide

An AC is testable if you can answer "yes" or "no" to it by interacting with the system or inspecting its output. It is vague if verifying it requires reading source code or making a judgment call.

**Weak vs. Strong Acceptance Criteria**

| Weak | Strong |
|------|--------|
| "The UI looks good" | "The modal renders within 200ms of button click and closes on Escape key" |
| "Errors are handled gracefully" | "When the API returns 500, the user sees 'Something went wrong. Try again.' and the form remains populated" |
| "The feature works for admins" | "A user with role=admin can access /admin/reports; a user with role=user receives 403" |
| "The user is notified" | "An email is sent to the user's address within 60 seconds of order confirmation" |
| "Data is saved correctly" | "After submission, a row appears in `orders` with `status='pending'` and the correct `user_id`" |

**AC patterns:**

- **State transition**: "Given [state], when [action], then [expected result]."
- **Boundary condition**: "A [field] rejects input [outside limit] with [specific message]."
- **Role-scoped**: "A user with role=[X] can/cannot [action]."
- **Data integrity**: "On [event], the `[table]` table gains a row with [fields and values]."

**AC count guidance:**
- 3 ACs minimum: happy path, at least one error state, one boundary condition
- 4–5 ACs ideal: add role/permission checks and additional edge cases
- 6+ ACs: warning — consider splitting the story

---

## Scope Field Guidance

All file paths in the Scope field must be real paths found during Phase 1 codebase analysis. Do not invent paths.

- If a file does not yet exist, mark it: `src/features/foo/Bar.tsx` — **(new file)**
- Do not use placeholder paths like `path/to/file.ext` or `src/components/SomeComponent`
- Directory-level entries (ending in `/`) are acceptable only when the story affects the entire directory — prefer specific file paths

| Weak | Strong |
|------|--------|
| `src/components/` — update notification component | `src/components/NavBar/NavBar.tsx` — add notification badge slot |
| Various service files | `src/services/NotificationService.ts` — add `markAsRead()` method |
| `path/to/api/endpoint` | `src/api/routes/notifications.ts` — add `GET /notifications` route |
