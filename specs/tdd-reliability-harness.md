# Spec: reliable-ai-agents — Agent-Agnostic Skill Registry

> Intent: [docs/intent/tdd-reliability-harness.md](../docs/intent/tdd-reliability-harness.md)
> Status: Draft — awaiting human review before Plan phase.

## Objective

Ship an npm package, **`reliable-ai-agents`**, that installs curated,
reliability-focused **skills** into any AI coding agent with one command:

```
npx reliable-ai-agents init
```

The package is a **repo of skills** — an extensible collection. The user picks
which **agent(s)** and which **skill(s)** to install, and the installer renders
each selected skill into each selected agent's native format at the correct path.

**Adding a new skill is drop-in:** author a canonical markdown doc plus a small
metadata file under `skills/`; no installer code changes. This extensibility is a
first-class feature, demoable and meant to grow.

**v1 ships the extensible architecture plus one flagship skill: the TDD
Reliability Harness.**

### Flagship skill — TDD Reliability Harness

Makes AI-assisted development reliable by construction. It forces every feature
through a fixed loop:

1. **Interview** the developer about one feature until expected behavior is concrete.
2. **Author test cases** from that interview and get explicit user approval —
   the approved tests become the spec.
3. **Locked red→green loop** — write the failing test, implement, run the
   project's own test runner, and iterate on the *same* feature until green.
   The agent may not declare "done" or move on until the test passes.

Two failure modes it eliminates:
- **Drift** — code that isn't what the user asked for (killed by the interview +
  approved-tests contract).
- **False done** — "complete ✅" with no evidence (killed by the locked loop
  requiring a passing test as proof).

**Users:** developers doing AI-assisted work on any supported agent, plus the
author as a portfolio showcase.

**Success looks like:** a dev runs one command, picks their agent and skills, and
gets reliability guarantees installed natively — regardless of which agent they
use — and can add their own skills to the repo without touching installer code.

## Tech Stack

- **Language:** TypeScript (strict), Node ≥ 18.
- **Distribution:** npm package with a `bin`; primary entry `npx reliable-ai-agents`.
- **CLI:** `commander` (arg parsing) + `@clack/prompts` (interactive pickers).
- **Build:** `tsup` (ESM + CJS + `.d.ts`).
- **Test:** `vitest` (unit + integration against a temp project dir).
- **Lint/format:** `biome` (single tool).
- Skill *content* is authored as markdown, not code (see Structure).

## Three Parts

1. **The skills registry** (`skills/`) — each skill is a directory with a
   canonical `skill.md` (behavior, the intellectual core) and a `meta.json`
   (id, title, description). The registry is discovered by scanning `skills/`.
2. **The adapters** (`src/agents/`) — one per agent, skill-agnostic. An adapter
   knows how to render *any* skill into its agent's native format and where to
   write it.
3. **The installer** (`src/`, the CLI) — resolves selected (skill × agent) pairs,
   renders each, and writes it to the right path.

All behavior lives in skill `skill.md` files; adapters are pure format-mappers so
a skill's guarantees are identical across every agent.

## Skills

A skill is a directory under `skills/`:

```
skills/tdd-reliability/
  skill.md        → canonical behavior (rendered into each agent)
  meta.json       → { "id", "title", "description", "version" }
```

- The registry is `skills/` scanned at build/run time — **adding a folder adds a
  skill**, no installer code change (drop-in requirement).
- `meta.json.id` is the stable slug used in output filenames and `--skill` flags.
- v1 registry contains exactly `tdd-reliability`.

## Supported Targets (adapters)

Output paths below use `<skill-id>` (e.g. `tdd-reliability`).

| Agent | Output path | Format notes |
|---|---|---|
| **Claude Code** (reference) | `.claude/skills/<skill-id>/SKILL.md` | Full-fidelity skill with frontmatter |
| Cursor | `.cursor/rules/<skill-id>.mdc` | `.mdc` frontmatter, `alwaysApply` |
| Windsurf | `.windsurf/rules/<skill-id>.md` | Rules dir |
| Gemini CLI | `GEMINI.md` | Injected block (one block per skill) |
| Codex | `AGENTS.md` | Injected block (shared standard) |
| OpenCode | `AGENTS.md` | Injected block (shared standard) |
| GitHub Copilot | `.github/copilot-instructions.md` | Injected block |
| Kiro IDE & CLI | `.kiro/steering/<skill-id>.md` | Steering file |
| Antigravity CLI | `AGENTS.md` | Injected block (default until native format verified) |

**Write strategy — non-negotiable safety rule:** for shared files that may hold
user content (`GEMINI.md`, `AGENTS.md`, `copilot-instructions.md`), the installer
never overwrites. It injects a per-skill delimited block:

```
<!-- reliable-ai-agents:<skill-id>:start -->
...skill content...
<!-- reliable-ai-agents:<skill-id>:end -->
```

Re-running `init` replaces only that skill's block (idempotent); all content
outside the markers — including *other* skills' blocks — is preserved
byte-for-byte. Dedicated files (Claude skill, Cursor `.mdc`) are one-file-per-skill
and created/overwritten wholesale since they're ours.

## The TDD Skill Behavior (flagship `skill.md` content)

The state machine the skill encodes:

```
INTERVIEW ──→ APPROVE ──→ RED ──→ GREEN ──→ DONE
                 ▲                   │
                 └──── (edit) ───────┘
```

- **INTERVIEW** — scope to exactly one feature. Ask targeted questions until the
  agent can state the expected behavior and its edge cases. No code yet.
- **APPROVE** — present concrete test cases (given / when / then). Require an
  explicit user "yes." Edits loop back here. This is the anti-drift gate.
- **RED** — write the test(s); run the project's runner; confirm it fails *for
  the right reason*. A test that passes or errors wrongly is a broken test — fix it.
- **GREEN** — implement the minimum to pass. Run the runner. If it fails, stay in
  GREEN and iterate on the *same* feature. Forbidden: touching other features,
  editing the approved test to force a pass, or declaring done.
- **DONE** — runner is green. Report with the runner output as proof. Only now
  may the agent move to the next feature.

**Firm gate with override:** if the user says "skip the test / just do it," the
agent pushes back once, then may proceed — but emits a visible
`⚠ RELIABILITY OVERRIDE: <feature> shipped without a passing test` marker so the
skip is never silent.

**Runner-agnostic:** the skill detects and drives the project's existing runner
(pytest, jest, vitest, go test, etc.). It ships none and prescribes no mocking
strategy.

## Commands

```
Build:  npm run build          # tsup
Test:   npm test               # vitest run
Cover:  npm run test:coverage  # vitest run --coverage
Lint:   npm run lint           # biome check
Format: npm run format         # biome format --write
Dev:    npx tsx src/cli.ts init
```

## Project Structure

```
skills/
  tdd-reliability/
    skill.md              → canonical behavior (source of truth)
    meta.json             → id, title, description, version
src/
  cli.ts                  → bin entry, commander setup
  commands/
    init.ts               → the `init` command flow (pick skills × agents)
  skills/
    registry.ts           → scan skills/, load skill.md + meta.json
  agents/
    index.ts              → adapter registry
    types.ts              → Adapter interface
    claude.ts, cursor.ts, gemini.ts, agents-md.ts, ...
  fs/
    inject.ts             → per-skill delimited-block create/replace (idempotent)
  detect.ts               → detect which agents a project already uses
tests/
  registry.test.ts        → skills discovered from skills/ dir
  inject.test.ts          → block injection idempotent + preserves other blocks
  agents/*.test.ts        → each adapter renders any skill validly
  init.test.ts            → integration: init writes correct files
docs/intent/              → confirmed intent
specs/                    → this spec
```

## Adapter Interface

Adapters are skill-agnostic: they take a resolved skill and render it.

```ts
export interface Skill {
  id: string;            // from meta.json
  title: string;
  description: string;
  content: string;       // canonical skill.md body
}

export interface Adapter {
  id: string;                          // stable id used for --agent and the picker
  label: string;                       // human label in the picker
  strategy: "overwrite" | "inject";
  /** where this skill is written, relative to the target project root */
  outputPath(skill: Skill): string;
  /** wrap the canonical skill in this agent's native format */
  render(skill: Skill): string;
  /** heuristic: is this agent already used in the target project? */
  detect(projectRoot: string): boolean;
}
```

## Code Style

- Strict TypeScript, ESM. Named exports. No default exports.
- Pure functions where possible; side effects (fs, prompts) isolated at the edges
  so the core is unit-testable without touching disk.
- Errors are explicit and actionable — never swallow.

```ts
export function injectBlock(
  existing: string,
  content: string,
  marker: string, // e.g. "reliable-ai-agents:tdd-reliability"
): string {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const block = `${start}\n${content}\n${end}`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (re.test(existing)) return existing.replace(re, block);
  return existing.trim() ? `${existing.trimEnd()}\n\n${block}\n` : `${block}\n`;
}
```

## Testing Strategy

- **Framework:** vitest. Tests live in `tests/`, mirroring `src/`.
- **We dogfood the skill** — the CLI is itself built test-first. This is the
  showcase's proof: the tool that enforces TDD was built with TDD.
- **Levels:**
  - *Unit* — `injectBlock` idempotency + preservation of *other* skills' blocks;
    registry discovers skills from `skills/`; each adapter's `render` produces
    valid native structure and preserves the skill's guarantees.
  - *Integration* — `init` against a temp dir writes selected (skill × agent)
    pairs to correct paths; re-running is idempotent; pre-existing `AGENTS.md`
    content and other skill blocks survive.
- **Drop-in test:** adding a fixture skill folder makes it appear in the registry
  and installable with **no code change**.
- **Coverage expectation:** ≥ 90% on `src/fs`, `src/agents`, `src/skills`.

## Boundaries

- **Always:** run `npm test` before commit; author new features test-first;
  preserve user content and other skills' blocks; keep skill behavior in
  `skill.md`, not hardcoded in adapters; keep adapters skill-agnostic.
- **Ask first:** adding a runtime dependency; changing the block-marker format
  (breaks existing installs); adding a CLI subcommand beyond `init`; changing the
  `skills/` layout or `meta.json` schema.
- **Never:** overwrite a user's `AGENTS.md`/`GEMINI.md`/`copilot-instructions.md`
  wholesale; delete another skill's block; commit secrets; weaken a generated
  skill so it silently skips tests.

## Success Criteria (testable)

1. `npx reliable-ai-agents init --agent claude --skill tdd-reliability` writes a
   valid `.claude/skills/tdd-reliability/SKILL.md`.
2. `init` with no flags shows interactive multi-selects for skills *and* agents,
   then writes each selected pair to its correct path.
3. Running `init` twice is idempotent — no duplicated blocks, no drift.
4. A pre-existing `AGENTS.md` (user content + another skill's block) retains both
   after `init` injects a skill block.
5. The generated TDD artifact contains all four guarantees: interview step,
   approved-tests gate, locked red→green loop, visible override marker.
6. **Drop-in:** dropping a new `skills/<id>/` fixture makes it discoverable and
   installable with no installer code change.
7. The package builds, lints clean, and all tests pass in a CI-equivalent run.

## Out of Scope (v1)

Registry ships exactly one skill (`tdd-reliability`). The TDD skill itself is
one-feature-at-a-time, local test loop only — no CI/CD, no coverage thresholds
enforced by the skill, no multi-feature orchestration, no mocking prescriptions,
no bundled test framework. CLI has `init` only — no `update`/`uninstall`/`list`.

## Resolved Decisions

1. **Antigravity CLI** — default to `AGENTS.md` injection; best-effort until its
   native format is verified.
2. **Package name** — `reliable-ai-agents` (available, unscoped).
3. **Claude Code delivery** — v1 ships each skill as a project-local skill
   (`.claude/skills/<skill-id>/SKILL.md`). Marketplace plugin is post-v1.
4. **No agent detected** — default to **Claude Code** (picker still shown).

## Future (post-v1)

- More skills in the registry (drop-in).
- Publish Claude Code delivery as a marketplace plugin.
- `list` / `update` / `uninstall` subcommands.
