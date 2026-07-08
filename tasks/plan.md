# Plan: reliable-ai-agents

> Spec: [specs/tdd-reliability-harness.md](../specs/tdd-reliability-harness.md)

## Approach

A **repo of skills** with a thin installer. Build bottom-up along the dependency
graph, test-first at every step (dogfooding). The pure core (`injectBlock`, skills
registry, adapters) is built and fully unit-tested before the I/O edges (`init`,
CLI) wire it together with integration tests. The flagship skill content is
authored as its own reviewed task. Extensibility (drop-in skills) is enforced by a
test, not just intent.

## Components & dependency order

```
[1] Scaffold (pkg, ts, biome, vitest, tsup)
        │
        ├──────────────┬───────────────┐
        ▼              ▼               ▼
[2] Flagship      [3] fs/inject   [4] Skills registry
    skill.md          (pure)          (scan skills/)
    + meta.json        │               │
        └──────┬───────┴───────┬───────┘
               ▼               ▼
        [5] Adapter interface + registry
               ▼
        [6] Adapters (claude, agents-md, gemini, copilot, cursor,
                       windsurf, kiro, antigravity) — skill-agnostic
               ▼
        [7] detect
               ▼
        [8] commands/init (pick skills × agents) + cli.ts  (integration)
               ▼
        [9] README + demo + publish prep
```

## Risks & mitigations

- **Clobbering user config / other skills' blocks** → `injectBlock` uses a
  per-skill marker and is built + tested first (idempotency, preserve *other*
  blocks). Highest-risk unit, earliest.
- **Extensibility rots** ("adding a skill needs code") → a drop-in fixture test
  (spec success criterion 6) guards it; adapters are skill-agnostic by interface.
- **Skill content quality** (the showcase value) → authored as its own reviewed
  task, not bundled into code.
- **Native format drift** → adapters isolated one-per-file.
- **Antigravity uncertainty** → `AGENTS.md` default; isolated, flagged.

## Parallelizable

- [2] skill content, [3] inject, [4] registry proceed in parallel after scaffold.
- Individual adapters in [6] are independent once [5] lands.

## Verification checkpoints

- After [3]/[4]: inject + registry unit tests green.
- After [6]: every adapter renders any skill validly (green).
- After [8]: integration green — spec success criteria 1–6 pass (incl. drop-in).
- After [9]: `npm run build && npm test && npm run lint` clean; local `npx . init`
  produces correct files in a scratch dir (criterion 7).
