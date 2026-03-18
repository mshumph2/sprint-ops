# Clarification Methodology

This reference defines how to conduct the clarification loop in Step 1 of the WBS Decomposer. Read this before asking your first clarifying question.

---

## Why Clarification Is Usually Required

Every product requirement — no matter how detailed — contains hidden assumptions. PRDs describe the happy path. They omit edge cases, assume shared context between author and reader, and frequently conflate outcomes with solutions. A WBS built on unexamined assumptions produces stories that solve the wrong problem, miss key stakeholders, or create rework when the real constraints surface later.

Clarification is not a signal that the PRD is bad. It is a standard part of the process. The loop may be skipped only when all six question categories are already covered — but the readiness signal must always be sent.

---

## The Loop

**Entry Condition:** Before asking the first question, assess all six question categories against the PRD. If one or more categories have genuine gaps, enter the loop. If all six are already covered by the PRD, skip the loop and send the readiness signal directly.

- Ask **one question per message**. Never batch questions.
- Wait for the user's answer before asking the next question.
- Continue until you have sufficient clarity (see stopping criteria below).
- When ready, send the readiness signal and wait for the user's response before proceeding.

**Readiness signal:**
> "I think I have what I need to start the codebase analysis. Anything you'd like to add or correct before I proceed?"

---

## Question Categories

Work through these categories in order. You do not need to ask a question in every category if a previous answer already covers it — but you must be confident it is covered before skipping.

### 1. End User
Who actually uses this feature? Be specific.

- Is there more than one user type? (e.g., admin vs. end user, B2B customer vs. their employee)
- What is their technical proficiency?
- Are they internal (employees) or external (customers, partners)?

**Why it matters**: Stories are framed as user outcomes. If you don't know who the user is, you can't write a valid "As a..." statement, and acceptance criteria will be too abstract to test.

### 2. Core Outcome
What does the user need to be able to *do* that they cannot do today?

- What is the before state vs. the after state?
- Is this net-new functionality or a change to existing behavior?
- If it's a change — what is broken or insufficient about the current behavior?

**Why it matters**: Requirements often describe a solution rather than the outcome. Understanding the outcome lets you identify when a story is solving the right problem and prevents over-scoping.

### 3. Constraints
What are the hard limits on how this can be built?

- Are there technology constraints? (must use existing stack, cannot introduce new dependencies, must integrate with a specific third-party service)
- Are there compliance or security constraints? (data residency, PII handling, audit logging requirements)
- Are there performance requirements? (latency SLAs, throughput targets, data volume)
- Are there organizational constraints? (team ownership, service boundaries that cannot be crossed)

**Why it matters**: Constraints directly affect story scoping. A story that ignores a compliance constraint will need to be rewritten. A story that crosses a service boundary the team doesn't own cannot be implemented independently.

### 4. Success Criteria
How will you know the feature is done and working?

- What does a stakeholder demo look like?
- Are there quantitative metrics? (conversion rate, error rate, latency)
- Are there existing tests or test environments that stories must pass in?
- Is there a definition of done beyond "it works"? (documentation, analytics instrumentation, feature flag, A/B test)

**Why it matters**: Acceptance criteria in stories must be verifiable. If the user cannot articulate success criteria, the acceptance criteria you write will be vague and untestable.

### 5. Edge Cases and Exclusions
What is explicitly out of scope, or what edge cases are already known?

- Are there user types, data states, or workflows that this feature explicitly does not cover?
- Are there related features that were considered and deferred?
- Are there known failure modes that must be handled (or explicitly deferred)?

**Why it matters**: Exclusions prevent scope creep in stories. Known edge cases may need their own stories or explicit Phase 0 prerequisites.

### 6. Dependencies and Context
What does this feature depend on that may not be in the codebase yet?

- Does this require a third-party integration that is not yet set up?
- Does it depend on another feature that is in progress or planned?
- Is there a design, spec, or architecture decision that has already been made that should constrain the WBS?

**Why it matters**: External dependencies are often Phase 0 prerequisites. An undiscovered dependency discovered late will invalidate the entire WBS.

---

## What "Sufficient Clarity" Means

You have sufficient clarity when you can honestly answer all of these:

- [ ] I know who the end user is (specifically enough to write "As a [role]" with a real role)
- [ ] I know what outcome the user needs, not just what the PRD proposes as a solution
- [ ] I know the hard constraints that will affect how stories are scoped and bounded
- [ ] I know what "done" looks like well enough to write testable acceptance criteria
- [ ] I know what is out of scope so I don't accidentally include it in a story
- [ ] I know of any external dependencies that need to be in Phase 0

If any of these is genuinely unknown, ask about it.

---

## Formulating Strong Questions

**Strong questions are specific, not generic.**

| Weak | Strong |
|------|--------|
| "Who is the user?" | "The PRD mentions 'users' — does this apply to all account types, or only to admins?" |
| "Are there any constraints?" | "The PRD touches the payments module — are there PCI compliance requirements we need to account for?" |
| "What does success look like?" | "Is there a metric this feature is intended to move, or is success defined by feature availability?" |

**Strong questions reference the PRD.** When something in the requirement is ambiguous, quote it:
> "The PRD says 'users should be notified' — what channel does that mean: email, in-app, push, or all three?"

**Strong questions expose assumptions.** The best clarifying questions make the user realize they hadn't thought something through:
> "The PRD describes the happy path — what should happen if the user's payment method fails during this flow?"

---

## Handling Edge Cases in the Clarification Loop

### The user says "just proceed" or "it's all in the PRD"

Respect the user's choice. Do not ask another question. Instead, acknowledge their preference, state the assumptions you will carry forward for any outstanding gaps, and offer one final chance to correct them:

> "Understood — I'll proceed with these assumptions for the open items:
>
> - [Assumption for gap 1]
> - [Assumption for gap 2]
>
> If any of those are wrong, correct me now. Otherwise I'll start the codebase analysis."

Wait for a single response. If the user confirms or says nothing, continue. If they correct an assumption, update it and continue. Do not re-enter the question loop.

### The user provides an extremely detailed PRD
Apply the entry condition: assess all six question categories against the PRD. If all six are genuinely covered, skip the loop and send the readiness signal. If any gaps remain, ask about them. A good PRD may require only 2–3 questions; a vague one may require 7–8. The number is not the point — coverage is.

### The user's answer introduces new ambiguity
Follow the thread. If an answer raises a new question in a different category, ask it before moving on. The loop is adaptive, not mechanical.

### The user answers a question you haven't asked yet
Note it and skip that question. Do not re-ask information you already have.
