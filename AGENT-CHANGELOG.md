# Agent Changelog

An append-only, human- and agent-auditable record of every change made to this
repository by an AI agent. Newest entries first.

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
