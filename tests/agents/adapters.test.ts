import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adapters, getAdapter } from "../../src/agents/index.js";
import type { Skill } from "../../src/skills/types.js";

const skill: Skill = {
  id: "test-first",
  title: "Test-First",
  description: "Test-first reliability.",
  content:
    "# Test-First\n\nINTERVIEW the user. Get APPROVE for tests.\nLocked RED then GREEN loop.\n⚠ RELIABILITY OVERRIDE marker.",
};

const EXPECTED_IDS = [
  "claude",
  "cursor",
  "windsurf",
  "kiro",
  "gemini",
  "copilot",
  "codex",
  "opencode",
  "antigravity",
];

describe("adapter registry", () => {
  it("exposes all expected agent ids", () => {
    const ids = adapters.map((a) => a.id).sort();
    expect(ids).toEqual([...EXPECTED_IDS].sort());
  });

  it("getAdapter returns an adapter by id and undefined otherwise", () => {
    expect(getAdapter("claude")?.id).toBe("claude");
    expect(getAdapter("nope")).toBeUndefined();
  });
});

describe.each(adapters)("adapter: $id", (adapter) => {
  it("renders content preserving all four guarantees", () => {
    const out = adapter.render(skill);
    expect(out).toContain("INTERVIEW");
    expect(out).toContain("APPROVE");
    expect(out).toMatch(/RED[\s\S]*GREEN/);
    expect(out).toContain("RELIABILITY OVERRIDE");
  });

  it("has a valid strategy", () => {
    expect(["overwrite", "inject"]).toContain(adapter.strategy);
  });

  it("produces a skill-scoped output path", () => {
    const path = adapter.outputPath(skill);
    expect(path.length).toBeGreaterThan(0);
    // dedicated-file agents scope the path by skill id; shared files don't
    if (adapter.strategy === "overwrite") {
      expect(path).toContain(skill.id);
    }
  });
});

describe("adapter specifics", () => {
  it("claude writes a namespaced SKILL.md with frontmatter", () => {
    const claude = getAdapter("claude");
    expect(claude?.outputPath(skill)).toBe(".claude/skills/test-first/SKILL.md");
    expect(claude?.strategy).toBe("overwrite");
    expect(claude?.render(skill)).toMatch(/^---\n[\s\S]*name:[\s\S]*---/);
  });

  it("cursor writes an .mdc rule with alwaysApply", () => {
    const cursor = getAdapter("cursor");
    expect(cursor?.outputPath(skill)).toBe(".cursor/rules/test-first.mdc");
    expect(cursor?.render(skill)).toContain("alwaysApply: true");
  });

  it("codex/opencode/antigravity all target AGENTS.md via inject", () => {
    for (const id of ["codex", "opencode", "antigravity"]) {
      const a = getAdapter(id);
      expect(a?.outputPath(skill)).toBe("AGENTS.md");
      expect(a?.strategy).toBe("inject");
    }
  });

  it("gemini and copilot use inject at their native paths", () => {
    expect(getAdapter("gemini")?.outputPath(skill)).toBe("GEMINI.md");
    expect(getAdapter("gemini")?.strategy).toBe("inject");
    expect(getAdapter("copilot")?.outputPath(skill)).toBe(".github/copilot-instructions.md");
  });

  it("detect() is true when the agent's native marker exists", () => {
    const root = mkdtempSync(join(tmpdir(), "rae-detect-"));
    mkdirSync(join(root, ".claude"), { recursive: true });
    writeFileSync(join(root, "GEMINI.md"), "hi");
    expect(getAdapter("claude")?.detect(root)).toBe(true);
    expect(getAdapter("gemini")?.detect(root)).toBe(true);
    expect(getAdapter("cursor")?.detect(root)).toBe(false);
  });
});
