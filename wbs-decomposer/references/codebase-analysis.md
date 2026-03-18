# Codebase Analysis Methodology

This reference provides the detailed methodology for Phase 1 of the WBS Decomposer. Read this when performing codebase analysis to ensure thorough coverage.

---

## Architecture Pattern Detection

### Signals for Each Pattern

**Monolith**
- Single deployable unit (one Dockerfile, one main entry point)
- Shared database connection, single ORM configuration
- All routes/controllers in one application
- Glob patterns to check: `Dockerfile`, `docker-compose.yml`, `main.*`, `app.*`, `server.*`

**Microservices**
- Multiple services with independent entry points
- Service-specific Dockerfiles or deployment configs
- Inter-service communication (HTTP clients, message queue consumers/producers)
- Glob patterns: `services/*/`, `apps/*/`, `packages/*/`, `**/Dockerfile`

**Modular Monolith**
- Single deployable unit but clear module boundaries
- Module-specific directories with internal structure (controllers, services, models)
- Internal module APIs or dependency injection between modules
- Glob patterns: `modules/*/`, `domains/*/`, `features/*/`

**Serverless**
- Function handlers as entry points
- Infrastructure-as-code defining functions (SAM, Serverless Framework, CDK, Terraform)
- Glob patterns: `serverless.yml`, `template.yaml`, `functions/*/`, `lambdas/*/`

### Layer Boundary Detection

Scan for common layer patterns:

| Layer | Common Directory Names | Common File Patterns |
|-------|----------------------|---------------------|
| Presentation/UI | `views/`, `pages/`, `components/`, `templates/` | `*.view.*`, `*.page.*`, `*.component.*` |
| Controllers/Handlers | `controllers/`, `handlers/`, `routes/`, `api/` | `*.controller.*`, `*.handler.*`, `*.route.*` |
| Services/Use Cases | `services/`, `usecases/`, `domain/`, `core/` | `*.service.*`, `*.usecase.*` |
| Data/Repository | `repositories/`, `dao/`, `data/`, `db/` | `*.repository.*`, `*.dao.*`, `*.model.*` |
| Infrastructure | `infra/`, `infrastructure/`, `config/`, `lib/` | `*.config.*`, `*.client.*` |

---

## Data Model Extraction

### Where to Find Data Models

**ORM Models (by framework)**

| Framework | Typical Locations | File Patterns |
|-----------|------------------|---------------|
| Django | `*/models.py` | `models.py`, `models/*.py` |
| Rails | `app/models/` | `*.rb` in models directory |
| TypeORM/Prisma | `src/entities/`, `prisma/schema.prisma` | `*.entity.ts`, `schema.prisma` |
| SQLAlchemy | `*/models/`, `*/models.py` | `*.py` with `Base` or `Model` imports |
| Sequelize | `*/models/` | `*.model.js`, `*.model.ts` |
| Hibernate/JPA | `*/entity/`, `*/model/` | `*.java` with `@Entity` annotation |
| EF Core | `*/Models/`, `*/Entities/` | `*.cs` with `DbContext` |

**Database Migrations**

| Framework | Migration Location |
|-----------|-------------------|
| Django | `*/migrations/` |
| Rails | `db/migrate/` |
| Prisma | `prisma/migrations/` |
| Flyway | `db/migration/`, `sql/` |
| Alembic | `alembic/versions/` |
| Knex/Sequelize | `migrations/` |
| EF Core | `Migrations/` |

**Schema Definitions**
- GraphQL: `*.graphql`, `*.gql`, `schema.graphql`
- Protobuf: `*.proto`
- OpenAPI: `openapi.yaml`, `swagger.json`, `*.openapi.yml`
- JSON Schema: `*.schema.json`

### Relationship Mapping

When extracting models, document:

1. **Primary entities**: Core business objects (User, Order, Product, etc.)
2. **Join tables**: Many-to-many relationship tables
3. **Dependent entities**: Objects that cannot exist without a parent (OrderItem depends on Order)
4. **Shared entities**: Objects referenced by multiple features or modules

For each relationship, note:
- Cardinality (1:1, 1:N, M:N)
- Whether cascading deletes are configured
- Which side owns the relationship
- Whether the relationship is enforced at DB level (foreign keys) or application level

---

## Service Boundary Mapping

### Internal Service Discovery

**REST/HTTP Services**
- Look for route definitions, controller registrations, API versioning
- Map each endpoint: method, path, request schema, response schema
- Identify which service/module handles each endpoint

**Event-Driven Services**
- Look for message queue consumers/producers (RabbitMQ, Kafka, SQS, etc.)
- Look for event bus patterns (EventEmitter, domain events, CQRS)
- Map each event: name, producer, consumer(s), payload schema

**Internal Package Dependencies**
- In monorepos, check `package.json` workspace dependencies
- Check import graphs to understand which modules depend on which
- Identify shared packages that multiple modules import

### Dependency Direction

For each service boundary, determine:
- **Upstream**: Services that this service calls
- **Downstream**: Services that call this service
- **Bidirectional**: Services with mutual dependencies (flag these — they complicate parallelization)

---

## Interface Cataloging

### External Interfaces

- Third-party API integrations (payment, auth, email, storage)
- Webhook receivers and senders
- OAuth/SSO providers
- CDN or asset pipeline configurations

### Internal Interfaces

- Shared type definitions (`types/`, `interfaces/`, `*.d.ts`)
- Shared utility libraries (`utils/`, `lib/`, `common/`, `shared/`)
- Shared middleware (auth, logging, error handling, rate limiting)
- Shared constants and enums

### Configuration Surfaces

- Environment variables (`.env`, `.env.example`, `*.env.*`)
- Application config files (`config/`, `settings/`, `*.config.*`)
- Feature flags (LaunchDarkly, Unleash, custom implementations)
- Infrastructure config (Terraform, CloudFormation, Kubernetes manifests)

---

## File Ownership Analysis

### Mapping Files to Domains

The goal is to partition the codebase into non-overlapping domains so that each story can be scoped to files within a single domain.

**Strategy 1: Directory-Based Domains**
If the codebase uses feature folders or domain folders, the mapping is straightforward:
```
features/authentication/ → Auth domain
features/billing/        → Billing domain
features/notifications/  → Notifications domain
```

**Strategy 2: Layer-Based Domains**
If the codebase uses layer folders, map across layers:
```
Auth domain:
  - controllers/auth.controller.ts
  - services/auth.service.ts
  - models/user.model.ts
  - routes/auth.routes.ts
```

**Strategy 3: Convention-Based Domains**
If neither strategy works, use file naming conventions and import analysis to cluster related files.

### Identifying Shared Files

Some files inherently belong to multiple domains:
- Database connection configuration
- Application entry point (main, app, server)
- Router configuration (if centralized)
- Middleware registration
- Global type definitions

Mark these as **shared infrastructure**. Changes to shared files should go in Phase 0 prerequisites.

---

## Change Impact Analysis

For each identified requirement capability:

1. **List all files that need modification** — be specific, not "the auth module"
2. **Classify each change**:
   - **Additive**: New file, new function, new endpoint (low conflict risk)
   - **Modifying**: Change existing function signature, modify schema (medium conflict risk)
   - **Restructuring**: Move files, rename modules, change inheritance (high conflict risk)
3. **Identify ripple effects**: If file A changes, what other files import from A and might break?
4. **Score conflict risk**: For each pair of capabilities that touch overlapping files, assess whether they can coexist

### Conflict Risk Matrix

Build a matrix of capabilities vs. files:

| File | Capability A | Capability B | Capability C | Conflict? |
|------|-------------|-------------|-------------|-----------|
| `models/user.ts` | Modify | Read only | — | No |
| `models/order.ts` | — | Add field | Add field | **Yes** |
| `routes/api.ts` | Add route | Add route | — | Low risk |

Use this matrix to inform story boundaries in Phase 2.
