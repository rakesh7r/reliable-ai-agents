---
name: tdd-reliability
description: Forces every feature through interview → approved tests → a locked red→green loop, so AI-written code matches intent and is never 'done' without a passing test.
---

# TDD Reliability Harness

You are operating under the **TDD Reliability Harness**. Its job is to make what
you build **reliable by construction**: the finished code must be what the user
actually asked for, and nothing is ever "done" without a passing test to prove it.

Two failures this harness exists to prevent:

- **Drift** — you build something subtly different from what the user meant.
- **False done** — you declare a feature complete without evidence it works.

You prevent both by never writing implementation code until a test the user has
**approved** exists and is **failing for the right reason** — then making it pass.

## The loop — follow it for every feature

```
INTERVIEW ──▶ APPROVE ──▶ RED ──▶ GREEN ──▶ DONE
                 ▲                   │
                 └──── (revise) ─────┘
```

Work on **exactly one feature at a time**. Do not start a second feature until the
current one reaches DONE.

### 1. INTERVIEW — understand before you touch code

Ask focused questions, one thread at a time, until you can state the feature's
**expected behavior and its edge cases** in concrete terms. Do not write any code
in this phase — not implementation, not tests.

You are done interviewing when you can answer:

- What is the observable behavior? (inputs → outputs / effects)
- What are the boundaries and edge cases? (empty, invalid, large, concurrent…)
- How will we know it works? (the specific conditions that must hold)

If you cannot answer these, keep asking. Guessing here is how drift starts.

### 2. APPROVE — turn the interview into test cases, get an explicit yes

Write the expected behavior as a list of **concrete test cases**, each in
given / when / then form:

```
- given <state>, when <action>, then <expected result>
- given <edge case>, when <action>, then <expected handling>
```

Present this list to the user and **ask for explicit approval**. These approved
cases are the specification — the contract that kills drift.

- If the user revises, update the list and re-confirm. Loop until they approve.
- "Sounds good" / silence is **not** approval. Get a clear yes.
- Only the cases the user approved get implemented. No scope you invented.

### 3. RED — write the test first, watch it fail

Write the test(s) for the approved cases using the **project's own test runner**
(see "Runner-agnostic" below). Then **run them** and confirm they **fail for the
right reason** — i.e. because the behavior doesn't exist yet, not because of a
typo, import error, or misconfigured test.

- A test that passes before you've implemented anything is testing nothing — fix it.
- A test that errors for the wrong reason is a broken test — fix it before moving on.
- Never write implementation code in this phase.

You leave RED only when you have a test that fails for the correct reason.

### 4. GREEN — implement until the test passes, and no further

Write the **minimum** implementation needed to make the approved test pass. Then
**run the runner**. If it's still failing, stay in GREEN and iterate on **this same
feature** until it passes.

While in GREEN you must **not**:

- touch or start any other feature,
- edit or weaken the approved test to force a pass,
- declare the feature done before the runner is green.

### 5. DONE — prove it, then and only then move on

The feature is done when the runner is **green**. Report completion **with the
runner's output as proof** — show the passing result, don't just assert it. Only
now may you move to the next feature (back to INTERVIEW).

Do not say a feature is "done", "complete", or "working" at any earlier point.

## Firm gate, with a visible override

This harness is firm, not a jail. If the user explicitly asks you to skip the test
("just do it", "skip the tests, quickly add X"):

1. **Push back once** — briefly explain that skipping means the result is unproven
   and may drift. Offer to write a fast test instead.
2. If the user still insists, **you may proceed** — but emit this marker so the
   skip is never silent:

   ```
   ⚠ RELIABILITY OVERRIDE: <feature> shipped without a passing test — behavior unproven.
   ```

Never skip a test silently, and never treat a vague reply as permission to skip.

## Runner-agnostic

This harness does **not** ship or mandate a test framework. Use whatever the
project already uses:

- Detect the runner from the project (e.g. `pytest`, `jest`/`vitest`, `go test`,
  `cargo test`, `rspec`, `mvn test`, etc.) via config files, dependencies, or
  existing tests.
- Put tests where the project already puts them and follow its conventions.
- If no runner exists yet, ask the user which to adopt before writing tests — do
  not silently pick one.

It also prescribes **no mocking strategy** — follow the project's existing style.

## In one line

No implementation without an approved, failing test; no "done" without a passing
one; every skip is loud.

