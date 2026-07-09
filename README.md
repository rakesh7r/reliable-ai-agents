# reliable-ai-agents

**Make AI-assisted development reliable by construction — on any coding agent.**

Every company now expects developers to build with AI. The problem: AI agents
*drift* from what you actually asked for, and declare things "done ✅" with no
proof they work. `reliable-ai-agents` installs skills that close both gaps.

One command installs them into whichever agent(s) you use:

```bash
npx reliable-ai-agents init
```

Pick your agents and skills, and the harness is written into each agent's native
format — no manual copy-paste, no wrong paths.

## Why

Three failure modes kill reliability in AI-assisted work:

- **Drift** — the agent builds something subtly different from what you meant.
- **False done** — the agent says "complete" without evidence.
- **Surprise diff** — you review the result and find surface area you never
  agreed to: extra files, a new dependency, an unasked-for refactor.

Two paired skills close these gaps. Each stands alone; run both and there's
nothing left to surprise you — the approach is agreed up front and the result is
proven at the end.

### Plan-First — agree *how* before any code changes

```
SCOPE ──▶ PLAN ──▶ APPROVE ──▶ BUILD ──▶ RECONCILE
              ▲                      │
              └──────── (revise) ────┘
```

Before touching code, the agent shows you the plan — **which files, which
dependencies, what structure, how big the diff** — and can't start until you
approve it. Then it builds only what was approved and reconciles the result
against it (this is what kills the surprise diff).

### Test-First — prove *what* it does before calling it done

```
INTERVIEW ──▶ APPROVE ──▶ RED ──▶ GREEN ──▶ DONE
                 ▲                   │
                 └──── (revise) ─────┘
```

1. **Interview** you about one feature until the expected behavior is concrete.
2. **Author test cases** and get your explicit approval — the approved tests
   become the spec (this is what kills drift).
3. **Locked red→green loop** — write the failing test, implement, run *your*
   test runner, and iterate until green. The agent can't say "done" or move on
   until the test passes (this is what kills false-done).

Both are a **firm gate, not a jail**: ask one to skip and it pushes back once,
then proceeds — but stamps a visible `⚠ PLAN OVERRIDE` / `⚠ RELIABILITY
OVERRIDE` so a skip is never silent. Test-First is **runner-agnostic** — it
drives pytest, jest, vitest, `go test`, etc.; it ships none.

## Supported agents

| Agent | Installed to |
|---|---|
| Claude Code (recommended) | `.claude/skills/<skill>/SKILL.md` |
| Cursor | `.cursor/rules/<skill>.mdc` |
| Windsurf | `.windsurf/rules/<skill>.md` |
| Kiro IDE & CLI | `.kiro/steering/<skill>.md` |
| Gemini CLI | `GEMINI.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex | `AGENTS.md` |
| OpenCode | `AGENTS.md` |
| Antigravity CLI | `AGENTS.md` |

Shared files (`AGENTS.md`, `GEMINI.md`, `copilot-instructions.md`) are **never
overwritten** — each skill is written as a delimited block, so your existing
content and other skills are preserved. Re-running `init` is idempotent.

## Usage

```bash
# interactive: pick skills and agents
npx reliable-ai-agents init

# non-interactive
npx reliable-ai-agents init --agent claude --skill test-first
npx reliable-ai-agents init --agent claude cursor codex --skill plan-first test-first
```

## Skills

This is an **extensible repo of skills**. v1 ships two:

| Skill | What it does |
|---|---|
| `plan-first` | Plan the change (files, deps, structure) → approve → build only that → reconcile |
| `test-first` | Interview → approved tests → locked red→green loop |

### Adding a skill

Skills are drop-in — **no installer code changes**. Add a folder under `skills/`:

```
skills/
  your-skill/
    skill.md      # the behavior, written as agent instructions
    meta.json     # { "id", "title", "description", "version" }
```

The registry discovers it automatically and every agent adapter renders it.

## Built with TDD

This tool was itself built test-first — the harness that enforces TDD is proven
by TDD. The suite gates the core:

```bash
npm test            # full suite
npm run test:coverage
```

## License

MIT © Rakesh G
