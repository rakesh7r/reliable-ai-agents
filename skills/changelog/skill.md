# Changelog

You are operating under the **Changelog** harness. Its job is to make sure no
change ever disappears into a session's dead memory: **before you may declare any
work done, you must record what you did** — what changed, why, which files, and how
you checked it — in an append-only changelog that both the user and the next agent
can audit later.

Two failures this harness exists to prevent:

- **Silent history** — a feature or fix ships and nothing durable records it. When
  the session ends its memory dies with it; nobody can reconstruct *what* changed or
  *why*, and the next agent re-learns the codebase from scratch.
- **Unauditable done** — you announce "done ✅" but leave no summary, so "done"
  can't be checked against what was actually delivered.

You prevent both by treating a changelog entry as a **required part of finishing**:
if you changed code or config in this session, you do not get to stop until the
entry is written.

## The loop — run it whenever you think you are done

```
DONE? ──▶ SUMMARIZE ──▶ RECORD ──▶ STOP
   ▲                        │
   └──────── (more?) ───────┘
```

This harness triggers on **your own intent to stop**. The moment you catch yourself
about to say a task is complete, hand back control, or move to an unrelated task —
pause and run this loop first.

### 1. DONE? — decide whether an entry is owed

An entry is owed if **this session created, modified, or deleted any code, config,
schema, or infrastructure** — anything a reviewer would see in a diff.

- **Files changed → an entry is required.** Do not stop without it.
- **Read-only work** (questions answered, code investigated, a review with no edits)
  → no entry. Don't clutter the log with "I looked at X."

If in doubt whether the work counts as a change, it does — write the entry.

### 2. SUMMARIZE — capture what actually happened, not what you intended

Write the summary from the **real** result of the session — the files you actually
touched and the outcome you actually observed. Do not describe the plan; describe
what shipped. Be honest about anything unfinished or unverified.

### 3. RECORD — append the entry to the changelog

The changelog lives at **`AGENT-CHANGELOG.md` in the repository root**, newest entry
on top. Before writing:

- **Read the top of the file** to match its existing entry format and avoid
  duplicating an entry already there.
- If the file does not exist, **create it** with the header shown below, then add
  your entry.

Write one entry per completed unit of work, using this format:

```markdown
## <YYYY-MM-DD> — <short imperative title>

- **What:** 1–3 sentences on the change, in plain language.
- **Why:** the request or reason it fulfills.
- **Files:** the key files created / modified / deleted.
- **Verified:** how you checked it — tests run and their result, the command, or
  the manual step. If it is **not** verified, say so and why.
- **Follow-ups:** anything deferred or left open. Omit if none.
```

New entries go **directly under the header, above the previous newest entry**. Never
edit or delete past entries — the log is append-only; correcting an earlier claim
means adding a new entry that supersedes it, not rewriting history.

If the file is new, start it with:

```markdown
# Agent Changelog

An append-only, human- and agent-auditable record of every change made to this
repository by an AI agent. Newest entries first.
```

### 4. STOP — only now may you declare done

With the entry written, finish: report what you did to the user *and* note that it's
recorded in `AGENT-CHANGELOG.md`. If more units of work remain, loop back — each gets
its own entry.

## Firm gate, with a visible override

This harness is firm, not a jail. If the user explicitly tells you not to log this
one ("don't bother with the changelog", "skip the log, just finish"):

1. **Push back once** — briefly note that an unlogged change leaves no audit trail
   for them or the next agent. Offer to write a one-line entry instead of a full one.
2. If the user still insists, **you may proceed** — but emit this marker so the
   missing record is never silent:

   ```
   ⚠ CHANGELOG OVERRIDE: <change> shipped without a changelog entry — no audit trail recorded.
   ```

Never skip the entry silently, and never fabricate a "Verified" line for a check you
did not actually run.

## Pairs with Plan-First and Test-First

Plan-First agrees *how* a change is made; Test-First proves *what* it does; Changelog
records *what was done* once it's finished. Same spine as the rest of the family —
except this one runs at the **end**, closing the loop so the work leaves a trail
instead of vanishing with the session. Each stands alone, too.

## In one line

No "done" until the change is recorded; the log is append-only and honest; every
skip is loud.
