# Parallelization Verification Rules

This reference provides the rules, patterns, and strategies for verifying that user stories in the WBS are truly parallelizable. Read this during Phase 5 (Parallelization Verification) and Phase 6 (Dependency Flagging).

---

## Independence Criteria

Two stories are **parallel** if and only if ALL of the following hold:

1. **File scope non-overlap**: They do not modify the same file, OR if they do, the modifications are to non-conflicting sections (e.g., adding separate functions to the same file, not modifying the same function).

2. **Data model non-conflict**: They do not add conflicting columns to the same table, change the same field type, or create migrations that must run in a specific order.

3. **Interface stability**: Neither story consumes an interface that the other story is modifying. Both stories can rely on the current interface contracts as-is.

4. **Migration independence**: Database migrations from each story can run in any order without breaking each other or the application.

5. **Configuration non-conflict**: They do not add the same environment variable, config key, or feature flag.

6. **Test isolation**: Each story's tests can pass regardless of whether the other story has been merged.

---

## Common Dependency Patterns

### Pattern 1: Shared Schema Change

**Symptom**: Two stories both need to add columns to the same database table.

**Example**:
- Story A: "Add user preferences" → adds `preferences JSONB` to `users` table
- Story B: "Add user avatar" → adds `avatar_url VARCHAR` to `users` table

**Risk**: Conflicting migration files. Both generate a migration that alters the same table. If migrations are numbered/timestamped, they may conflict on merge.

**Resolution**:
- Extract the schema change into Phase 0 if both columns are needed
- OR ensure the migration framework supports concurrent migrations on the same table (most timestamp-based frameworks do)
- Document the risk and recommend merging whichever lands second's migration carefully

### Pattern 2: Shared Configuration

**Symptom**: Two stories both need new environment variables or config entries.

**Example**:
- Story A: Adds `STRIPE_API_KEY` to `.env`
- Story B: Adds `SENDGRID_API_KEY` to `.env`

**Risk**: Low if adding different keys. High if both modify the same config object structure.

**Resolution**:
- If keys are independent (different names, different purposes), this is safe — note as low-risk parallel
- If both modify the same config object shape, extract config changes into Phase 0

### Pattern 3: Shared Middleware

**Symptom**: Two stories need to modify the same middleware (auth, logging, error handling).

**Example**:
- Story A: "Add admin role check" → modifies auth middleware
- Story B: "Add rate limiting per user" → modifies auth middleware

**Risk**: High. Both modify the same middleware file and potentially the same function.

**Resolution**:
- Extract shared middleware changes into Phase 0
- OR redesign so each story adds its own middleware in the chain rather than modifying existing middleware

### Pattern 4: Shared API Endpoint

**Symptom**: Two stories need to modify the same API endpoint.

**Example**:
- Story A: "Add filtering to GET /users" → modifies the users controller
- Story B: "Add pagination to GET /users" → modifies the same controller

**Risk**: High. Both modify the same handler function.

**Resolution**:
- Combine into a single story if the scope is small enough
- OR extract the endpoint handler refactoring into Phase 0, then each story adds its feature to a well-structured handler

### Pattern 5: Shared UI Component

**Symptom**: Two stories need to modify the same UI component.

**Example**:
- Story A: "Add notifications icon to nav bar" → modifies `NavBar` component
- Story B: "Add user avatar to nav bar" → modifies `NavBar` component

**Risk**: Medium to high depending on component complexity.

**Resolution**:
- If the component accepts props/slots, each story can add its own sub-component (low conflict)
- If both need to modify the component's structure, extract the structural change into Phase 0

### Pattern 6: Shared Type Definitions

**Symptom**: Two stories need to extend the same type/interface.

**Example**:
- Story A: Adds `preferences` field to `User` type
- Story B: Adds `avatarUrl` field to `User` type

**Risk**: Low in most cases (additive type changes rarely conflict) but needs verification.

**Resolution**:
- If both are additive (adding new optional fields), this is usually safe — note as low-risk parallel
- If either changes existing fields or makes fields required, extract the type change into Phase 0

### Pattern 7: Shared Test Fixtures

**Symptom**: Two stories need the same test fixture or factory that doesn't exist yet.

**Example**:
- Story A: Needs a `createTestUser()` factory with preferences
- Story B: Needs a `createTestUser()` factory with avatar

**Risk**: Both create conflicting versions of the same fixture.

**Resolution**:
- Extract shared test infrastructure into Phase 0
- OR ensure each story uses its own fixture namespace

---

## Resolution Strategies

When stories cannot be trivially parallelized, apply these strategies in order:

### Strategy 1: Extract to Phase 0

Move the shared dependency into a prerequisite that completes before parallel stories begin.

**When to use**: The shared change is small, well-defined, and genuinely needed by multiple stories.

**Example**: Both stories need a new `status` column on the `orders` table → Phase 0 adds the column, then both stories can use it in parallel.

### Strategy 2: Interface Contract

Define the interface/contract upfront so both stories can code against it independently.

**When to use**: The shared dependency is an API or function signature, not data.

**Example**: Story A produces an event, Story B consumes it → Define the event schema in Phase 0, then both stories can implement their side independently.

### Strategy 3: Additive-Only Scoping

Restructure stories so each only adds new code (files, functions, endpoints) without modifying existing code.

**When to use**: The feature can be implemented by adding new modules rather than modifying existing ones.

**Example**: Instead of both stories modifying the router file, each story adds a new route file that gets auto-discovered.

### Strategy 4: Feature Flags

Use feature flags to isolate changes so both stories can merge without affecting each other.

**When to use**: The codebase already has a feature flag system, and the feature is user-facing.

**Example**: Both stories modify the dashboard page → each wraps its changes in a feature flag.

### Strategy 5: Sequential Ordering

Accept that the stories are not parallel and assign an explicit order.

**When to use**: None of the above strategies work, and the dependency is fundamental.

**Document**: Which story must come first and why. This is a valid outcome — not every requirement can be parallelized.

---

## Verification Checklist

Run this checklist for every pair of stories that are marked as parallel:

### File-Level Checks
- [ ] List all files modified by Story A
- [ ] List all files modified by Story B
- [ ] Identify any files that appear in both lists
- [ ] For shared files: verify modifications are to non-conflicting sections
- [ ] For shared files: verify no function/method is modified by both stories

### Data-Level Checks
- [ ] List all data models modified by Story A
- [ ] List all data models modified by Story B
- [ ] Verify no model has conflicting field additions
- [ ] Verify migrations can run in any order
- [ ] Verify no foreign key dependencies between new fields

### Interface-Level Checks
- [ ] List all interfaces/APIs consumed by Story A
- [ ] List all interfaces/APIs produced/modified by Story A
- [ ] List all interfaces/APIs consumed by Story B
- [ ] List all interfaces/APIs produced/modified by Story B
- [ ] Verify no story consumes what another produces (unless the interface already exists and is stable)

### Configuration-Level Checks
- [ ] List all config/env changes in Story A
- [ ] List all config/env changes in Story B
- [ ] Verify no overlapping config keys
- [ ] Verify no conflicting config file structural changes

### Test-Level Checks
- [ ] Verify Story A's tests do not depend on Story B's implementation
- [ ] Verify Story B's tests do not depend on Story A's implementation
- [ ] Verify no shared test fixtures are created by both stories

---

## Flagging Format

When a dependency cannot be resolved, flag it in the WBS output using this format:

```markdown
## Flagged Dependencies

### Dependency: [Short Description]

**Coupled Stories**: Story N and Story M
**Type**: [Schema Conflict | Interface Dependency | Shared File | Config Conflict | Migration Order]
**Description**: [Explain why these stories cannot be implemented in parallel]
**Impact if Parallelized**: [What goes wrong — merge conflicts, data corruption, broken tests, etc.]
**Suggested Resolution**:
- [Option 1: Extract to Phase 0]
- [Option 2: Sequence Story N before Story M]
- [Option 3: Other resolution]
```

---

## Edge Cases

### Monorepo with Shared Packages

In monorepos, a shared package change can affect multiple services. Treat shared package modifications as Phase 0 prerequisites unless:
- The change is additive (new export, new function)
- No existing consumers are affected
- The package has proper versioning

### Database Migrations in CI

If the CI pipeline runs all migrations sequentially, two stories with independent migrations can still fail if:
- Both migrations lock the same table (in production-like environments)
- Migration filenames collide (timestamp-based is safer than sequential numbering)

### Feature Branch Merge Order

Even if stories are parallel, the order they merge to main can matter:
- If Story A's migration runs first in main, Story B's migration must still be compatible
- Verify that the merge order does not matter by checking migration independence

### Shared State in Tests

Integration tests that share database state can create false coupling. Verify that each story's tests either:
- Use isolated test databases/schemas
- Use transactions that roll back
- Create and clean up their own test data

---

## Gotchas

Watch out for these common pitfalls during decomposition. Each represents a class of hidden coupling that frequently surfaces only at merge time.

### Shared Database Migrations
Multiple stories that each add columns to the same table will create conflicting migrations. Extract the schema change into Phase 0 or consolidate the migration.

### Shared Configuration Files
Stories that both need new environment variables can conflict if they modify the same `.env` or config file. Scope config changes carefully.

### Circular Service Dependencies
If Service A calls Service B and the requirement adds a call from B back to A, this creates a circular dependency. Flag it.

### Authentication/Authorization Changes
Auth middleware is almost always shared. If multiple stories need auth changes, extract the auth work into Phase 0.

### Shared UI Components
If multiple stories need to modify the same component (e.g., a navigation bar), extract the component change into Phase 0 or sequence the stories.

### Test Infrastructure
Stories that require new test utilities, fixtures, or helpers that other stories also need should have those extracted into Phase 0.

### API Versioning
If multiple stories modify the same API endpoint, they will conflict. Consider whether the endpoint should be versioned or if the changes should be combined into one story.
