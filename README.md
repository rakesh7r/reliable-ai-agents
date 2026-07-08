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

Two failure modes kill reliability in AI-assisted work:

- **Drift** — the agent builds something subtly different from what you meant.
- **False done** — the agent says "complete" without evidence.

The flagship **TDD Reliability Harness** eliminates both by forcing every feature
through a fixed loop:

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

It's a **firm gate, not a jail**: ask it to skip and it pushes back once, then
proceeds — but stamps a visible `⚠ RELIABILITY OVERRIDE` so a skip is never
silent. It's **runner-agnostic** — it drives pytest, jest, vitest, `go test`,
etc.; it ships none.

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
npx reliable-ai-agents init --agent claude --skill tdd-reliability
npx reliable-ai-agents init --agent claude cursor codex --skill tdd-reliability
```

## Skills

This is an **extensible repo of skills**. v1 ships one:

| Skill | What it does |
|---|---|
| `tdd-reliability` | Interview → approved tests → locked red→green loop |

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
