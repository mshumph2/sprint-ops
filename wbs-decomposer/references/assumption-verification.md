# Assumption Verification Methodology

This reference provides the complete methodology for Phase 3: Assumption Verification — compiling, presenting, and applying corrections to assumptions made during Phases 1 and 2.

---

## 3.1 Compile Assumptions

Gather every non-trivial inference made so far across four categories:

1. **Requirement Interpretation** — how you read ambiguous or underspecified parts of the PRD (e.g., "I interpreted 'user dashboard' to mean the existing `/app/dashboard` page, not a new standalone page")
2. **File/Module Ownership** — which files you attributed to which domain or feature area (e.g., "I mapped authentication to `src/auth/` and assumed `src/middleware/session.ts` is owned by that domain")
3. **Architecture Decisions** — inferences about layer boundaries, patterns, or system structure (e.g., "I assumed this is a feature-folder monolith, not a layered architecture")
4. **Parallelizability** — which capabilities you believe can be implemented independently and why (e.g., "I assumed Story 3 and Story 4 can run in parallel because they touch different modules with no shared data models")

Only list assumptions that, if wrong, would materially change the stories. Omit trivially obvious inferences. Cap at 10 assumptions maximum — rank by impact (effect on story scope, story count, or parallelization structure) and present only the top 10. If fewer than 3 assumptions exist, present all of them; do not pad. A focused list of 5 high-risk assumptions is better than an exhaustive 12.

---

## 3.2 Present to User

Present the compiled assumptions grouped by category, then ask:

> "These are the assumptions I've made before generating stories. Please confirm, correct, or add context to any of them. When you're ready, say 'proceed' and I'll generate the stories."

Wait for a full response before continuing. Do not proceed on silence.

---

## 3.3 Apply Corrections

If the user corrects an assumption:

- Acknowledge the correction explicitly
- Update your understanding for the affected category:
  - **Requirement interpretation** corrections → revise the capability mapping from Phase 2
  - **File/module ownership** corrections → update the file scope used in story generation
  - **Architecture decision** corrections → revise the layer analysis from Phase 1
  - **Parallelizability** corrections → pre-seed the dependency flags used in Phase 5
- Ask: "Any other corrections before I proceed?"

Do not re-run full analysis phases. Apply targeted corrections and continue.
