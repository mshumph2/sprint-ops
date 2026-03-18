# Sprint Ops

Agent skills for product requirement decomposition and sprint planning, built on the [Agent Skills](https://agentskills.io) specification.

## Available Skills

| Skill | Description |
|-------|-------------|
| **wbs-decomposer** | Decompose a PRD, Epic, or feature request into parallelizable user stories grounded in codebase analysis |

## Installation

Requires [Claude Code](https://claude.ai/claude-code) v1.0.33 or later.

### 1. Add the marketplace

```
/plugin marketplace add mshumph2/sprint-ops
```

### 2. Install the plugin

```
/plugin install wbs-decomposer@sprint-ops-skills
```

### 3. Reload plugins

```
/reload-plugins
```

## Usage

Once installed, the skill activates automatically when you ask Claude Code to break down a product requirement. You can also reference it directly:

- "Break this PRD into parallel user stories"
- "Create a WBS for this epic"
- "Decompose this feature into stories that can be worked simultaneously"

The skill will:
1. Collect your product requirement (pasted inline or from a file)
2. Analyze the current codebase architecture
3. Decompose requirements into independently implementable user stories
4. Verify parallelizability and flag any unavoidable dependencies
5. Write a `wbs.md` file with the complete work breakdown structure

Before decomposing, the skill may ask up to 5 clarifying questions about the requirement to ensure accurate story scoping. It produces a `wbs.md` document — not code, tests, or time estimates.

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) — commit message format drives automated versioning via semantic-release:

- `feat:` → minor version bump
- `fix:` → patch version bump
- `feat!:` or `BREAKING CHANGE:` → major version bump

Releases are created automatically when commits are pushed to `main` via GitHub Actions. Do not manually edit `CHANGELOG.md` or version fields in `marketplace.json` / `SKILL.md` — these are updated by the release pipeline.

## License

MIT
