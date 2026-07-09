import { describe, expect, it } from "vitest";
import { injectBlock } from "../src/fs/inject.js";

const MARKER = "reliable-ai-agents:test-first";

describe("injectBlock", () => {
  it("creates a delimited block in an empty file", () => {
    const result = injectBlock("", "HELLO", MARKER);
    expect(result).toContain(`<!-- ${MARKER}:start -->`);
    expect(result).toContain("HELLO");
    expect(result).toContain(`<!-- ${MARKER}:end -->`);
  });

  it("appends a block to existing user content, preserving it", () => {
    const existing = "# My Agents File\n\nSome user rules.";
    const result = injectBlock(existing, "HARNESS", MARKER);
    expect(result).toContain("# My Agents File");
    expect(result).toContain("Some user rules.");
    expect(result).toContain("HARNESS");
    // user content comes before the injected block
    expect(result.indexOf("Some user rules.")).toBeLessThan(result.indexOf("HARNESS"));
  });

  it("is idempotent — re-injecting the same content does not duplicate", () => {
    const once = injectBlock("user stuff", "V1", MARKER);
    const twice = injectBlock(once, "V1", MARKER);
    expect(twice).toBe(once);
    const startCount = twice.split(`<!-- ${MARKER}:start -->`).length - 1;
    expect(startCount).toBe(1);
  });

  it("replaces block content in place when re-injecting new content", () => {
    const once = injectBlock("user stuff", "OLD", MARKER);
    const updated = injectBlock(once, "NEW", MARKER);
    expect(updated).toContain("NEW");
    expect(updated).not.toContain("OLD");
    expect(updated).toContain("user stuff");
  });

  it("preserves a different skill's block when injecting", () => {
    const other = "reliable-ai-agents:other-skill";
    const withOther = injectBlock("base", "OTHER_CONTENT", other);
    const withBoth = injectBlock(withOther, "MINE", MARKER);
    expect(withBoth).toContain("OTHER_CONTENT");
    expect(withBoth).toContain("MINE");
    expect(withBoth).toContain(`<!-- ${other}:start -->`);
    expect(withBoth).toContain(`<!-- ${MARKER}:start -->`);
  });

  it("does not let one skill's marker match another's block", () => {
    // updating skill A must not touch skill B even though markers share a prefix
    const a = injectBlock("", "A_CONTENT", "reliable-ai-agents:a");
    const both = injectBlock(a, "B_CONTENT", "reliable-ai-agents:b");
    const updatedB = injectBlock(both, "B_UPDATED", "reliable-ai-agents:b");
    expect(updatedB).toContain("A_CONTENT");
    expect(updatedB).toContain("B_UPDATED");
    expect(updatedB).not.toContain("B_CONTENT");
  });
});
