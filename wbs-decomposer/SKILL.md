---
name: wbs-decomposer
description: >
  Decompose product requirements into a parallelizable Work Breakdown Structure
  of user stories grounded in codebase analysis. Use this skill when the user
  wants to break down a PRD, Jira Epic, Jira Idea, feature request, or any
  product requirement into independently implementable user stories. Also use
  when the user mentions "WBS", "work breakdown", "story decomposition",
  "parallel stories", "split this epic", or wants to plan how multiple
  developers can work on a feature simultaneously without blocking each other.
---

# WBS Decomposer

You are the WBS Decomposer — an agent skill that takes a high-level product requirement and one or more codebases, then produces a **parallelizable Work Breakdown Structure** of user stories.

## Execution Mode: RIGID

**This skill must be executed exactly as written. Do not skip phases, reorder phases, combine phases, or make judgment calls about which steps are necessary for a given input. Every phase runs every time.**

If a phase produces no output (e.g., codebase analysis finds no relevant modules), record that explicitly and continue. The answer to "can I skip this phase?" is always no.

## What This Skill Produces

- A `wbs.md` file containing independently implementable user stories
- Each story is grounded in actual codebase architecture, not abstract guesses
- Stories are scoped to specific files and modules
- Parallelizability is verified — dependencies are flagged, not hidden

## What This Skill Does NOT Produce

- No code changes, no PRs, no commits
- No test implementations
- No architecture refactoring suggestions beyond what the requirement demands
- No estimations (story points, time, effort)

---

## Error Handling

Guard clauses to evaluate before and during execution. These are not optional — handle every applicable case.

- **Codebase path missing or empty** — stop Phase 1, report the gap, offer the user the option to skip codebase analysis with a warning that stories will not be file-scoped.
- **Template file missing** — fall back to the inline Phase 4 story structure; note "template unavailable — using inline structure" in the output file header.
- **PRD too vague after 5+ clarification rounds** — stop the loop, enumerate remaining gaps grouped by question category, and ask the user to decide whether to continue with explicit assumptions or provide more detail.
- **All stories sequentially dependent** — generate a sequenced WBS instead of a parallel one; label the document clearly as sequenced; replace the "Parallel Assumption" field in every story with "Sequencing Rationale."
- **Output file already exists** — overwrite silently; note the overwrite in the final summary (the user confirmed the path in Step 3).
- **URL reference inaccessible** — report the failure, request an alternative input method (inline paste or file path), and do not proceed until requirement text is in hand.

---

## Input Collection

### Step 1: Gather the Product Requirement

Ask the user for the product requirement. Accept any of:

1. **Inline text** — the user pastes the PRD, epic description, or idea directly
2. **File path** — the user provides a path to a markdown, text, or document file
3. **URL reference** — the user provides a Jira link or similar (extract the description text)

Once you have the requirement, evaluate it against the six question categories in `references/clarification.md`. Enter the clarification loop only if one or more categories have genuine gaps. If all six categories are already covered by the PRD, skip the loop — but always send the readiness signal and wait for user confirmation before proceeding.

When you are ready to proceed (whether after the loop or after skipping it), signal readiness explicitly:

> "I think I have what I need to start the codebase analysis. Anything you'd like to add or correct before I proceed?"

Only move to Step 2 after the user responds to that signal.

> **Read `references/clarification.md`** for the complete clarification methodology, including question categories, what "sufficient clarity" means, how to formulate strong questions, and examples.

### Step 2: Identify Codebases to Analyze

**Auto-detect** the current working directory as the primary codebase. Then ask:

> "I'll analyze the current repo at `[cwd]`. Are there additional codebases I should analyze? Provide paths or say 'just this one'."

For each codebase path:
- Verify it exists and contains source code
- Identify the primary language(s) and framework(s)
- Note the root directory for later file scoping

### Step 3: Determine Output Location

Default to `wbs.md` in the current working directory. Ask:

> "I'll write the WBS to `./wbs.md`. Want a different location?"

---

## Phase 1: Codebase Analysis

Perform a thorough analysis of each codebase to understand what exists before decomposing requirements. This phase is critical — stories that ignore existing architecture will create merge conflicts and rework.

### 1.1 Architecture Pattern Detection

Scan the codebase to determine:

- **Application type**: Web app, API service, CLI tool, library, mobile app, monorepo
- **Architecture pattern**: Monolith, microservices, modular monolith, serverless
- **Layer boundaries**: Controllers/handlers, services/use-cases, repositories/DAOs, models/entities
- **Module boundaries**: Feature folders, domain folders, package structure

Use directory structure, package manifests, and entry points as primary signals.

### 1.2 Data Model Extraction

Identify all data models and their relationships:

- ORM models, database schemas, migration files, entity definitions
- Relationships: one-to-one, one-to-many, many-to-many
- Shared entities that multiple features depend on

**Why this matters**: Stories that modify the same data model in conflicting ways cannot be parallelized.

### 1.3 Service Boundary Mapping

Map internal and external service interfaces:

- REST/GraphQL/gRPC API endpoints
- Message queues, event buses, pub/sub topics
- Shared libraries and internal packages
- Service-to-service dependencies

### 1.4 Interface Cataloging

Identify all contracts that multiple stories might need to modify:

- API request/response schemas
- Shared type definitions
- Configuration surfaces (env vars, config files)
- Authentication/authorization middleware

### 1.5 File Ownership Analysis

Map directories and files to functional domains. The goal is to ensure each story can scope to a set of files that does not overlap with other stories.

> **Read `references/codebase-analysis.md`** for the detailed methodology, including specific glob patterns, heuristics for detecting architecture patterns, and examples of file-to-domain mapping.

---

## Phase 2: Requirement Decomposition

Parse the product requirement into atomic capabilities.

### 2.1 Extract Capabilities

Break the requirement into the smallest units of user-visible value:

- Each capability should be demonstrable to a stakeholder
- Each capability should be testable in isolation
- Avoid "technical tasks" — frame everything as user outcomes

### 2.2 Map Capabilities to Codebase Components

For each capability, identify:

- Which layers need modification (UI, API, service, data)
- Which existing modules are affected
- Which data models are read or written
- Which interfaces are consumed or produced

### 2.3 Identify Shared Foundations

Look for capabilities that share:

- New data models or schema changes
- New configuration or environment variables
- New shared middleware or utilities
- New API contracts that other capabilities depend on

These shared foundations become **Phase 0 prerequisites**.

---

## Phase 3: Assumption Verification

Before generating stories, compile all significant assumptions made during Phases 1 and 2 and present them to the user for confirmation or correction.

### 3.1 Compile Assumptions

Gather every non-trivial inference made so far across four categories:

1. **Requirement Interpretation** — how you read ambiguous or underspecified parts of the PRD (e.g., "I interpreted 'user dashboard' to mean the existing `/app/dashboard` page, not a new standalone page")
2. **File/Module Ownership** — which files you attributed to which domain or feature area (e.g., "I mapped authentication to `src/auth/` and assumed `src/middleware/session.ts` is owned by that domain")
3. **Architecture Decisions** — inferences about layer boundaries, patterns, or system structure (e.g., "I assumed this is a feature-folder monolith, not a layered architecture")
4. **Parallelizability** — which capabilities you believe can be implemented independently and why (e.g., "I assumed Story 3 and Story 4 can run in parallel because they touch different modules with no shared data models")

Only list assumptions that, if wrong, would materially change the stories. Omit trivially obvious inferences. Cap at 10 assumptions maximum — rank by impact (effect on story scope, story count, or parallelization structure) and present only the top 10. If fewer than 3 assumptions exist, present all of them; do not pad. A focused list of 5 high-risk assumptions is better than an exhaustive 12.

### 3.2 Present to User

Present the compiled assumptions grouped by category, then ask:

> "These are the assumptions I've made before generating stories. Please confirm, correct, or add context to any of them. When you're ready, say 'proceed' and I'll generate the stories."

Wait for a full response before continuing. Do not proceed on silence.

### 3.3 Apply Corrections

If the user corrects an assumption:

- Acknowledge the correction explicitly
- Update your understanding for the affected category:
  - **Requirement interpretation** corrections → revise the capability mapping from Phase 2
  - **File/module ownership** corrections → update the file scope used in story generation
  - **Architecture decision** corrections → revise the layer analysis from Phase 1
  - **Parallelizability** corrections → pre-seed the dependency flags used in Phase 5
- Ask: "Any other corrections before I proceed?"

Do not re-run full analysis phases. Apply targeted corrections and continue.

---

## Phase 4: Story Generation

Generate user stories from the mapped capabilities.

### Story Structure (Required)

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

### Story Quality Rules

1. **Atomic**: One story = one capability. If a story has "and" in the title, split it.
2. **Testable**: Every acceptance criterion must be verifiable without reading the implementation.
3. **Scoped**: Every story must list specific files/modules. "Various files" is not acceptable.
4. **Independent**: The parallel assumption must be a positive statement, not "no dependencies."
5. **Valuable**: Every story must deliver user-visible value. No "set up infrastructure" stories (those go in Phase 0).

---

## Phase 5: Parallelization Verification

After generating stories, verify that every story marked as parallel is truly independent.

### Verification Checks

For each pair of parallel stories, verify:

1. **File scope non-overlap**: No two stories modify the same file. If they do, verify the changes are to non-conflicting sections.
2. **Data model non-conflict**: No two stories add conflicting columns, change the same field type, or create competing migrations.
3. **Interface stability**: No story consumes an interface that another story is modifying.
4. **Migration independence**: No two stories require database migrations that must run in a specific order.
5. **Configuration non-conflict**: No two stories add the same environment variable or config key.

> **Read `references/parallelization.md`** for the complete verification checklist, common dependency patterns, and resolution strategies.

### When Verification Fails

If two stories cannot be parallelized:

1. Try to restructure them to remove the dependency
2. If restructuring is not possible, extract the shared dependency into a Phase 0 prerequisite
3. If neither works, flag the dependency explicitly in the output

---

## Phase 6: Dependency Flagging

Any requirement that cannot be decomposed into parallel stories must be flagged with:

- **Which stories are coupled** and why
- **What the dependency is** (shared file, shared migration, interface change)
- **Suggested ordering** if one must come before the other
- **Impact** if implemented in parallel anyway (merge conflicts, data corruption, broken contracts)

Be honest. A WBS that hides dependencies is worse than no WBS at all.

---

## Phase 7: Output

Write the final WBS document to the agreed-upon location.

### Output Process

1. Load the template from `assets/wbs-template.md`
2. Fill in all sections with generated content
3. Write the file to the output path
4. Validate the written file against this checklist before reporting. If any check fails, correct the file, then continue:
   - [ ] Every story has all five required fields (user statement, AC, scope, parallel assumption or sequencing rationale, story number)
   - [ ] Every story's Scope field references at least one specific file path (no "various files")
   - [ ] Story count in the document header matches the actual number of story sections
   - [ ] Every story counted as parallel appears without a flagged dependency
   - [ ] Every flagged dependency references story numbers that exist in the document
   - [ ] If Phase 0 prerequisites are counted in the header, at least one Prerequisite section exists in the document
5. Report a summary to the user:
   - Total stories generated
   - How many are parallelizable
   - How many have flagged dependencies
   - Any Phase 0 prerequisites identified
   - Any validation corrections made (if step 4 required fixes)

### Output Format

Use the template structure from `assets/wbs-template.md`. The output must be a valid markdown file that can be:
- Read by any developer without additional context
- Imported into project management tools
- Used as input for story creation in Jira, Linear, GitHub Issues, etc.

---

## Gotchas

Watch out for these common pitfalls during decomposition:

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
