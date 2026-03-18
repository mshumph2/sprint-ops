# Requirement Decomposition Methodology

This reference defines how to execute Phase 2 of the WBS Decomposer: parsing a product requirement into atomic capabilities, mapping those capabilities to codebase components, and identifying shared foundations that must become Phase 0 prerequisites.

---

## Why This Phase Is Difficult

Requirements describe outcomes from the user's perspective. Codebases are organized around implementation. The gap between those two frames is where bad decompositions happen — either by splitting too finely (producing micro-stories with no independent value) or too coarsely (producing mega-stories that cannot be worked in parallel). Phase 2 is the translation layer. Done right, it produces capabilities that map cleanly to files, are demonstrable to a stakeholder, and can be handed to separate developers without coordination overhead.

---

## 2.1 Extract Capabilities

### What Is an Atomic Capability?

An **atomic capability** is the smallest unit of user-visible value that can be demonstrated, tested, and delivered independently.

**Stopping rule**: A capability is atomic when removing any part of it means the user gets no value. If you can remove a sub-feature and the user still has something useful, that sub-feature is its own capability.

**Why this matters**: Over-splitting creates stories that depend on each other by definition (you cannot "view a notification" until "notification" is a concept in the system). Under-splitting creates stories that require multiple developers to work in the same files, which defeats parallelization.

### Identifying Capability Boundaries

Look for **verbs that describe what the user does**, not what the system does internally:

- "The user **submits** a payment" — capability
- "The user **views** their order history" — capability
- "The system **validates** the payload" — implementation detail, not a capability
- "The database **migrates** to add columns" — Phase 0 prerequisite, not a capability

A capability boundary is reached when:
1. The user can observe a distinct before/after state change
2. The capability can be demoed to a stakeholder independently
3. The capability has its own testable acceptance criteria that do not require another capability to be present

### Weak vs. Strong Capability Extraction

| Weak | Strong |
|------|--------|
| "Authentication and authorization system" | Separate: "User can log in with email/password" / "Admin can access restricted pages" |
| "Notification feature" | Separate: "User receives email on order confirmation" / "User can mark notifications as read" / "User sees unread badge in nav" |
| "Set up the orders table and create an order" | "User can submit an order" (table creation → Phase 0) |
| "Improve dashboard performance" | "Dashboard loads in under 2 seconds for users with 1,000+ orders" |
| "User management" | Separate: "Admin can create a user" / "Admin can deactivate a user" / "User can update their profile" |

### Anti-Patterns

**Over-splitting**: Capabilities broken so small that no individual one has user-visible value.
- Example: "Backend adds order ID field to orders table" is not a user capability. "User receives order confirmation with order number" is.
- Signal: The capability's user story starts with "As a developer" or describes a technical artifact.

**Under-splitting**: Multiple distinct outcomes bundled into one capability because they share a data model or route.
- Example: "User can create, read, update, and delete their profile" is four capabilities sharing a model. Each CRUD operation touches different code paths and can be implemented independently.
- Signal: The capability title contains "and" or a list of actions.

**Technical task framing**: Infrastructure or implementation work disguised as a user story.
- Example: "Set up Redis caching layer" is not a user outcome. If caching is necessary, it is a Phase 0 prerequisite or a performance AC on a real capability.
- Signal: Removing this "capability" from the WBS does not degrade the user experience.

---

## 2.2 Map Capabilities to Codebase Components

### Layer-Mapping Decision Rules

For each capability, determine which layers require modification:

| Layer | Modify when... |
|-------|----------------|
| **UI / Frontend** | The capability has a visible interaction surface (form, page, modal, component state) |
| **API / Route handler** | The capability exposes or consumes an HTTP/GraphQL/gRPC endpoint |
| **Service / Use-case** | The capability involves business logic, validation, or orchestration between data sources |
| **Data / Repository** | The capability reads from or writes to a persistent store, or requires a schema change |
| **Infrastructure / Config** | The capability requires new environment variables, feature flags, or external service setup |

**Flag as complex** if a capability touches all five layers. Consider splitting it before proceeding. A capability that modifies UI, API, service, data, and config simultaneously is almost certainly two capabilities bundled together.

### File-Scoping Methodology

Trace each capability from entry point to data store:

1. **Start at the entry point**: For a web capability, this is a route or page component. For an API capability, this is the route handler registration file.
2. **Trace to the service layer**: Follow the handler to the service or use-case it calls. Note the service file.
3. **Trace to the data layer**: Follow the service to its repository or ORM call. Note the model/schema file.
4. **Note interfaces consumed**: Any external service clients, message publishers, or shared utilities called along the trace.

Record the full trace. Do not stop at the entry point — stories with only "controller modified" in their scope are under-specified and will cause rework when the developer discovers the service and data layers.

### What to Record per Capability

| Field | What to capture |
|-------|----------------|
| **Layers touched** | Which of: UI, API, service, data, infrastructure |
| **Modules affected** | Specific directories or feature folders from Phase 1 analysis |
| **Data models read** | Existing models queried by this capability |
| **Data models written** | Existing models mutated, or new models created |
| **Interfaces consumed** | External services, shared utilities, or APIs called |
| **Interfaces produced** | New endpoints, events, or contracts this capability creates |

### Example Trace: PRD Language → File Scope

**PRD requirement**: "Users should be able to export their order history as a CSV."

| Step | Finding |
|------|---------|
| Entry point | New page at `/account/orders/export` — `src/pages/account/OrderExport.tsx` (new) |
| Route handler | `src/api/routes/account.ts` — add `GET /account/orders/export` |
| Service layer | `src/services/OrderService.ts` — add `exportOrdersCsv(userId)` method |
| Data layer | `src/models/Order.ts` — read-only, no schema change; `src/db/queries/orders.ts` — add export query |
| Interface consumed | `src/lib/csv.ts` — existing CSV utility (or new file if none exists) |
| Interface produced | New `GET /account/orders/export` endpoint returning `text/csv` |

The capability is now file-scoped. Every file in its story Scope field is grounded in this trace.

---

## 2.3 Identify Shared Foundations

### The Core Decision Rule

A **shared foundation** is something one capability creates that at least one other capability depends on. If two capabilities cannot both start on Day 1 without coordinating, the thing they need to coordinate around is a Phase 0 prerequisite.

**Test**: Ask for each pair of capabilities — "Could two separate developers start these on the same morning without talking to each other?" If no, find the blocker. That blocker is the shared foundation.

**Why this matters**: A WBS that labels stories as parallel when they share an undiscovered foundation will produce merge conflicts, broken tests, and developer frustration. Phase 0 prerequisites exist precisely to surface these blockers before any code is written.

### Four Categories of Shared Foundations

**1. New data models or schema changes**

If a capability requires a new database table, a new migration, or a new schema that other capabilities read, that schema is a Phase 0 prerequisite.

- Signal: Multiple capabilities reference the same new entity in their data model mapping.
- Example: "User can submit a review" and "User can see average rating" both need a `reviews` table. The table creation is Phase 0.

**2. New configuration or environment variables**

If a capability requires a new third-party service credential, feature flag, or infrastructure configuration that other capabilities also use, the configuration setup is a Phase 0 prerequisite.

- Signal: Multiple capabilities list the same new environment variable in their infrastructure layer.
- Example: Two capabilities that both call a new email service both need `SENDGRID_API_KEY` configured. Configure once in Phase 0.

**3. New shared middleware or utilities**

If a capability requires a new cross-cutting concern (auth check, rate limiter, shared validator, shared type definition) that other capabilities will also use, the middleware/utility is a Phase 0 prerequisite.

- Signal: A utility appears in the "interfaces consumed" column for multiple capabilities, but does not yet exist in the codebase.
- Example: Three capabilities all need to check a `feature_flags` table before executing. The flag-checking middleware is Phase 0.

**4. New API contracts**

If capability A produces an interface (a new endpoint, an event schema, a function signature) that capability B consumes, capability B cannot be implemented until A's interface is defined. Extract the interface definition into Phase 0.

- Signal: Capability B's "interfaces consumed" column lists something in capability A's "interfaces produced" column.
- Example: A mobile app story consumes a new REST endpoint that a backend story creates. The endpoint contract (schema, URL, auth mechanism) is Phase 0.

### How to Detect Shared Foundations Early

Cross-reference the capability mapping table:

1. For every entry in any capability's **data models written** column — does any other capability have the same entry in its **data models read** column?
2. For every entry in any capability's **interfaces produced** column — does any other capability have it in its **interfaces consumed** column?
3. For every entry in any capability's **infrastructure** column — does the same entry appear for multiple capabilities?

Each "yes" is a candidate shared foundation. Evaluate whether it can be built incrementally (the producing capability is implemented first, the consuming capability follows) or whether both capabilities truly need it at the same time (Phase 0 prerequisite).

### Anti-Pattern: Misclassifying User Stories as Prerequisites

Not every dependency becomes a Phase 0 prerequisite. The test is whether the thing being depended on has **user-visible value of its own**.

| Classification | Example | Reason |
|---------------|---------|--------|
| Phase 0 (correct) | "Create `reviews` table migration" | No user-visible value. Schema change only. |
| Regular story (correct) | "User can submit a review" | User-visible value. Happens to be a prerequisite for the rating story. |
| Phase 0 (incorrect) | "User can log in" called a prerequisite because ratings require login | Login is a user-visible capability. Model it as a story with a dependency note, not a Phase 0 item. |

Phase 0 is for work with no user-visible value on its own. If removing it from the WBS would leave a visible hole in the user experience, it is a story — even if other stories depend on it.
