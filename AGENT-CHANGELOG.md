# Agent Changelog

An append-only, human- and agent-auditable record of every change made to this
repository by an AI agent. Newest entries first.

## 2026-07-10 — Rename the `root-cause` skill to `bugfix`

- **What:** Renamed the bug-fixing skill's id/title/harness name from `root-cause`
  to `bugfix` (folder, `meta.json`, `skill.md` heading + override marker, README row,
  loader test). The "root cause" technique language in the body is unchanged — only
  the skill's name moved.

## 2026-07-10 — Add the `root-cause` bug-fixing skill

- **What:** Added a fifth reliability skill, `root-cause`, that governs bug fixing:
  the agent must reproduce a bug and trace it to its actual cause before editing,
  capture it in a failing regression test, then fix and prove both the reproduction
  and the rest of the suite are green. Loop: `REPRODUCE → DIAGNOSE → CAPTURE → FIX →
  VERIFY`.
- **Why:** The family covered making, shipping, and recording changes but not the
  most common defect-fixing failures — patching the symptom instead of the cause,
  and "fixing" a bug on a guess with no proof it's gone. `root-cause` closes that gap
  while reusing Test-First's red→green mechanic.
- **Files:** `skills/root-cause/meta.json`, `skills/root-cause/skill.md`,
  `tests/registry.test.ts` (added a loader test), `README.md` (skills table now
  lists five), `package.json` + `package-lock.json` (version → 0.5.0), and this file.
- **Verified:** `npm test` — 59 passing across 5 files.

## 2026-07-09 — Make changelog entries scale with change size

- **What:** Added guidance to the `changelog` skill so entries stay terse for small
  changes and only expand for large/complex ones; **What** + title are now the only
  required fields.

## 2026-07-09 — Add the `changelog` skill

- **What:** Added a fourth reliability skill, `changelog`, that forces the agent to
  summarize its work and append an entry to an auditable `AGENT-CHANGELOG.md` before
  it may declare a task done. Triggers on the agent's own intent to stop; only fires
  when files were actually changed.
- **Why:** So no change ever ships without a durable, auditable trail for both the
  user and the next agent — closing the "silent history" and "unauditable done" gaps.
- **Files:** `skills/changelog/meta.json`, `skills/changelog/skill.md`,
  `tests/registry.test.ts` (added a loader test), `README.md` (skills table now
  lists four), `package.json` + `package-lock.json` (version → 0.4.0), and this file.
- **Verified:** `npm test` — 58 passing across 5 files.
