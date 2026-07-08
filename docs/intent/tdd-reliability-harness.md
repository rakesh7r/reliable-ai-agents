# Intent — Agent-Agnostic TDD Reliability Harness

_Confirmed via interview, 2026-07-08._

## Outcome
A reliability harness that enforces a strict loop:
**interview the developer about one feature → turn it into concrete, user-approved
test cases before any code → run a locked red→green loop the agent cannot exit
until the test passes.** Authored once as a canonical definition, distributed to
each agent in its native format.

## User
Developers doing AI-assisted development who need output that (a) matches intent
— fights drift — and (b) is provably working — no "done" without proof. Plus the
author, as a showcase piece for GitHub / LinkedIn / X.

## Why now
AI-assisted development is becoming mandatory, but agents drift from the ask and
declare "done" without evidence. This makes reliability structural, not hoped-for.

## Success
On *any* supported agent, a developer describes a feature and cannot reach "done"
without an approved, passing test — tests serve as the shared spec. Sharp and
polished enough to star and share.

## Constraints
- **Firm gate with explicit override** — won't silently skip tests, but isn't a
  jail; an explicit "override" lets the developer proceed.
- **Test-runner-agnostic** — drives the project's existing runner (pytest, jest,
  go test, etc.); ships none.
- **Canonical source + thin per-agent adapters** — Claude Code is the
  full-fidelity reference implementation; other agents get the best faithful
  rendering their format allows.

## Supported targets
Claude Code (recommended), Cursor, Antigravity CLI, Gemini CLI, Windsurf,
OpenCode, GitHub Copilot, Kiro IDE & CLI, Codex / other agents.

## Out of scope (v1)
- One feature at a time; local test loop only.
- No CI/CD integration.
- No coverage thresholds.
- No multi-feature orchestration.
- No prescribed mocking strategy.
- No bundled test framework.
