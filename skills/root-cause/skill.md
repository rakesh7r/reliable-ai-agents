# Root-Cause

You are operating under the **Root-Cause** harness. Its job is to make bug fixes
**real**: you do not touch the code until you have *reproduced* the bug and traced
it to its *actual cause*, and you do not call it fixed until that reproduction is
green — with a test left behind so the bug can never quietly come back.

Two failures this harness exists to prevent:

- **Symptom patch** — you suppress the visible failure (swallow the exception, add a
  guard at the crash site, special-case the one input that broke) without finding
  *why* it happened. The real cause survives and the bug resurfaces elsewhere, or the
  whole class of it stays live.
- **Phantom fix** — you change code on a *guess* about the cause, never having
  confirmed the bug actually happens or that your edit stops it. "Should be fixed
  now" with no evidence is not a fix.

You prevent both by refusing to edit until you can reproduce the bug and name its
root cause, capturing that reproduction as a **failing test**, and only then fixing —
proving the test goes green and nothing else broke.

## The loop — follow it for every bug

```
REPRODUCE ──▶ DIAGNOSE ──▶ CAPTURE ──▶ FIX ──▶ VERIFY
                  ▲                        │
                  └──────── (wrong?) ──────┘
```

Fix **one bug at a time**. Do not start a second bug, or fold in an unrelated
refactor, until the current one reaches VERIFY.

### 1. REPRODUCE — make the bug happen on purpose

Before touching anything, get the bug to fail reliably in front of you: the exact
inputs, state, or steps that trigger it, and the wrong result you observe. Note what
you *expected* instead.

- **Can't reproduce it?** Then you cannot fix it — say so, and ask for the missing
  piece (repro steps, environment, a failing input, logs). Do not "fix" a bug you
  have never seen fail. Guessing from a report alone is how phantom fixes ship.
- Nail down the smallest reliable trigger you can; a fuzzy repro hides the cause.

### 2. DIAGNOSE — trace to the cause, not the crash site

Follow the failure back to the line that is *actually wrong*, not the line where it
surfaced. The place it throws is often downstream of the real defect.

State the **causal chain** before you edit: *this input → this wrong state here →
this observed failure.* If you cannot explain why the bug happens, you are not ready
to fix it — keep investigating.

- Prefer the fix that removes the cause over the one that hides the effect.
- If diagnosis proves your first theory wrong, loop back — a fix aimed at the wrong
  cause is a symptom patch wearing a disguise.

### 3. CAPTURE — pin the bug in a failing test

Write a test, in the **project's own test runner**, that fails *because of this bug*
and would pass once it's fixed. Run it and confirm it **fails for the right reason** —
it reproduces the defect, not a typo or a misconfigured test.

- This test is the regression guard: it is what stops the bug returning silently.
- If the bug genuinely cannot be covered by an automated test (e.g. a one-off
  environment/config issue), say so explicitly and describe the manual reproduction
  you will use to verify instead — never skip this step silently.

You leave CAPTURE only with a test that fails for the correct reason.

### 4. FIX — remove the cause, minimally

Make the **smallest** change that addresses the root cause you named in DIAGNOSE.
Then run the runner.

While fixing you must **not**:

- edit or weaken the failing test to force it green,
- patch the symptom instead of the cause you identified,
- fold in unrelated cleanup or a second bug's fix — those are separate units of work.

### 5. VERIFY — prove it's gone and nothing else broke

The bug is fixed when **both** hold, shown with the runner's output as proof:

- the reproduction test now **passes**, and
- the **rest of the suite still passes** — you fixed the bug without regressing
  anything else.

Report the fix with that evidence, and state the root cause you removed in one line.
Do not say a bug is "fixed", "resolved", or "working" before the runner is green on
both counts. If more bugs remain, loop back — each gets its own reproduction.

## Firm gate, with a visible override

This harness is firm, not a jail. If the user explicitly tells you to skip the repro
or just patch it ("don't bother reproducing", "just slap a fix in, I'll test it"):

1. **Push back once** — briefly note that an unreproduced fix may miss the real cause
   and leaves no guard against the bug returning. Offer to write a fast reproduction
   test instead.
2. If the user still insists, **you may proceed** — but emit this marker so the
   unproven fix is never silent:

   ```
   ⚠ ROOT-CAUSE OVERRIDE: <bug> patched without a reproduction — cause unconfirmed, no regression guard.
   ```

Never skip the reproduction silently, and never fabricate a passing result for a
check you did not actually run.

## Runner-agnostic

This harness ships **no** test framework. Capture the reproduction with whatever the
project already uses — `pytest`, `jest`/`vitest`, `go test`, `cargo test`, `rspec`,
`mvn test`, etc. — detected from its config, dependencies, or existing tests, and
placed where that project keeps its tests. If the project has no runner at all, say
so and reproduce manually rather than silently introducing one.

## Pairs with Test-First

Test-First proves a **new** behavior into existence; Root-Cause proves a **broken**
one is gone — and stays gone. Both drive a failing test to green, but Root-Cause adds
the two phases Test-First doesn't have: **reproduce** the defect and **diagnose** its
cause before any test or code is written. Same spine as the rest of the family; it
just starts from a bug instead of a blank page. It stands alone, too.

## In one line

No fix without a reproduction; trace the cause, not the crash site; leave a
regression test behind; prove both the bug and the suite are green; every skip is
loud.
