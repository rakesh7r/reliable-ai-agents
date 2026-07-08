# Tasks: reliable-ai-agents

> Plan: [tasks/plan.md](plan.md) · Spec: [specs/tdd-reliability-harness.md](../specs/tdd-reliability-harness.md)
> A repo of skills + a thin installer. Built test-first (dogfooding). Order = dependency order.

- [x] **1. Scaffold the project**
  - Acceptance: `package.json` (bin `reliable-ai-agents`, ESM), `tsconfig` (strict),
    `biome.json`, `vitest.config`, `tsup.config`; `npm test` runs (0 tests OK),
    `npm run lint` clean.
  - Verify: `npm run build && npm test && npm run lint`.
  - Files: package.json, tsconfig.json, biome.json, vitest.config.ts, tsup.config.ts

- [x] **2. Author the flagship skill** (`skills/tdd-reliability/`)
  - Acceptance: `skill.md` encodes INTERVIEW → APPROVE → RED → GREEN → DONE, the
    firm-gate override with visible marker, runner-agnostic instruction; reads as a
    real agent instruction. `meta.json` has id/title/description/version.
  - Verify: manual review against spec §"TDD Skill Behavior"; all 4 guarantees present.
  - Files: skills/tdd-reliability/skill.md, skills/tdd-reliability/meta.json

- [x] **3. `injectBlock`** (`src/fs/inject.ts`) — TDD
  - Acceptance: per-skill marker; creates when absent; replaces in place
    (idempotent); preserves content outside markers AND *other* skills' blocks;
    handles empty file.
  - Verify: `npm test tests/inject.test.ts` green.
  - Files: src/fs/inject.ts, tests/inject.test.ts

- [x] **4. Skills registry** (`src/skills/registry.ts`) — TDD
  - Acceptance: scans `skills/`, loads each `skill.md` + `meta.json` into a `Skill`;
    returns list sorted by id; ignores non-skill dirs.
  - Verify: `npm test tests/registry.test.ts` green (incl. a fixture skill).
  - Files: src/skills/registry.ts, src/skills/types.ts, tests/registry.test.ts

- [x] **5. Adapter interface + registry** (`src/agents/types.ts`, `index.ts`)
  - Acceptance: `Adapter` interface per spec (skill-agnostic `render`/`outputPath`);
    registry exports all target ids.
  - Verify: type-checks; registry unit test lists expected ids.
  - Files: src/agents/types.ts, src/agents/index.ts, tests/agents/registry.test.ts

- [x] **6. Adapters** — TDD, one test per adapter
  - Acceptance: each `render(skill)` returns valid native format (frontmatter where
    needed), preserves the skill's guarantees, and `outputPath(skill)` +
    `strategy` are correct. claude/cursor/windsurf/kiro=overwrite dedicated files;
    agents-md(codex/opencode/antigravity)/gemini/copilot=inject.
  - Verify: `npm test tests/agents` green.
  - Files: src/agents/{claude,cursor,windsurf,gemini,copilot,kiro,agents-md}.ts,
    tests/agents/*.test.ts

- [x] **7. Agent detection** (`src/detect.ts`) — TDD
  - Acceptance: detects agents present via marker paths; returns Claude Code as
    default when none detected.
  - Verify: `npm test tests/detect.test.ts` green (temp dirs).
  - Files: src/detect.ts, tests/detect.test.ts

- [x] **8. `init` command + CLI** (`src/commands/init.ts`, `src/cli.ts`) — TDD
  - Acceptance: `--agent`/`--skill` flags install that pair; no flags → interactive
    multi-selects for skills and agents (defaults = detected/Claude); writes each
    pair to correct path; idempotent re-run; preserves pre-existing `AGENTS.md` +
    other skill blocks. Drop-in fixture skill installs with no code change.
  - Verify: `npm test tests/init.test.ts` green — covers spec success criteria 1–6.
  - Files: src/commands/init.ts, src/cli.ts, tests/init.test.ts

- [x] **9. Docs + publish prep**
  - Acceptance: README (pitch, one-line install, agent × skill tables, "how to add
    a skill" section, demo placeholder, "built with TDD" proof), LICENSE,
    `files`/`bin` in package.json, `.npmignore`.
  - Verify: `npm pack --dry-run` includes dist + skills/; `npx . init` in a scratch
    dir produces correct files (criterion 7).
  - Files: README.md, LICENSE, package.json, .npmignore
