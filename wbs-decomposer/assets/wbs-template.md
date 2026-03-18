# Work Breakdown Structure: [Feature Name]

**Source**: [PRD title or reference — e.g., "Jira EPIC-123: User Notification System"]
**Analyzed Codebases**: [list of repo paths analyzed]
**Generated**: [YYYY-MM-DD]
**Total Stories**: [N]
**Parallelizable**: [N of N] | **Flagged**: [N]

---

## Architecture Summary

[Brief summary of the analyzed codebase architecture relevant to this feature. Include:
- Application type and architecture pattern
- Key modules/services affected
- Primary language(s) and framework(s)
- Data models involved]

---

## Prerequisites (Phase 0)

[Any shared foundational changes that must complete before parallel stories begin.
Each prerequisite should include what it is, why it's needed, and which stories depend on it.

If none needed, state: "No shared prerequisites identified — all stories are independently implementable."]

### Prerequisite 1: [Title]

**What**: [Description of the change]
**Why**: [Which parallel stories depend on this being in place first]
**Scope**:
- `path/to/file.ext` — [what changes]

---

## User Stories

### Story 1: [Concise Title]

**As a** [specific role], **I want** [specific capability], **so that** [measurable benefit].

**Acceptance Criteria:**
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]

**Scope:**
- `path/to/file1.ext` — [specific change description]
- `path/to/directory/` — [specific change description]

**Parallel Assumption:** [Explicit statement of why this story can be implemented independently of the others — reference specific file non-overlap, interface stability, or data model independence]

---

### Story 2: [Concise Title]

**As a** [specific role], **I want** [specific capability], **so that** [measurable benefit].

**Acceptance Criteria:**
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]
- [ ] [Observable, testable criterion]

**Scope:**
- `path/to/file1.ext` — [specific change description]
- `path/to/directory/` — [specific change description]

**Parallel Assumption:** [Explicit statement of why this story can be implemented independently]

---

[Continue for each story...]

---

## Flagged Dependencies

[Requirements that could NOT be decomposed into fully parallel stories.
If none, state: "No unresolvable dependencies identified."]

### Dependency: [Short Description]

**Coupled Stories**: Story N and Story M
**Type**: [Schema Conflict | Interface Dependency | Shared File | Config Conflict | Migration Order]
**Description**: [Explain why these stories cannot be implemented in parallel]
**Impact if Parallelized**: [What goes wrong — merge conflicts, data corruption, broken tests, etc.]
**Suggested Resolution**:
- [Option 1]
- [Option 2]

---

## Notes

- [Any additional context, caveats, or recommendations]
- [Assumptions made during decomposition]
- [Areas that may need further clarification with the product owner]
