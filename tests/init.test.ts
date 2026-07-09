import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getAdapter } from "../src/agents/index.js";
import { installSelected } from "../src/commands/init.js";
import { loadSkills } from "../src/skills/registry.js";

const here = dirname(fileURLToPath(import.meta.url));
const realSkills = loadSkills(resolve(here, "../skills"));
const testFirst = realSkills.find((s) => s.id === "test-first");
if (!testFirst) throw new Error("flagship skill missing");

function tempRoot(): string {
  return mkdtempSync(join(tmpdir(), "rae-init-"));
}

describe("installSelected", () => {
  it("writes a valid Claude SKILL.md for the flagship skill (criterion 1)", () => {
    const root = tempRoot();
    const written = installSelected(root, [testFirst], [getAdapter("claude")!]);
    const path = join(root, ".claude/skills/test-first/SKILL.md");
    const body = readFileSync(path, "utf8");
    expect(written).toContain(".claude/skills/test-first/SKILL.md");
    expect(body).toMatch(/^---\n[\s\S]*name: test-first[\s\S]*---/);
    expect(body).toContain("Test-First");
  });

  it("writes each selected agent to its correct path (criterion 2)", () => {
    const root = tempRoot();
    installSelected(root, [testFirst], [getAdapter("claude")!, getAdapter("gemini")!]);
    expect(() => readFileSync(join(root, ".claude/skills/test-first/SKILL.md"))).not.toThrow();
    expect(() => readFileSync(join(root, "GEMINI.md"))).not.toThrow();
  });

  it("is idempotent across repeated installs (criterion 3)", () => {
    const root = tempRoot();
    installSelected(root, [testFirst], [getAdapter("gemini")!]);
    const first = readFileSync(join(root, "GEMINI.md"), "utf8");
    installSelected(root, [testFirst], [getAdapter("gemini")!]);
    const second = readFileSync(join(root, "GEMINI.md"), "utf8");
    expect(second).toBe(first);
    const marks = second.split("reliable-ai-agents:test-first:start").length - 1;
    expect(marks).toBe(1);
  });

  it("preserves pre-existing AGENTS.md user content and other blocks (criterion 4)", () => {
    const root = tempRoot();
    const existing =
      "# House rules\n\nBe kind.\n\n<!-- reliable-ai-agents:other:start -->\nOTHER\n<!-- reliable-ai-agents:other:end -->\n";
    writeFileSync(join(root, "AGENTS.md"), existing);
    installSelected(root, [testFirst], [getAdapter("codex")!]);
    const body = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(body).toContain("Be kind.");
    expect(body).toContain("OTHER");
    expect(body).toContain("Test-First");
  });

  it("emits the four guarantees in generated output (criterion 5)", () => {
    const root = tempRoot();
    installSelected(root, [testFirst], [getAdapter("cursor")!]);
    const body = readFileSync(join(root, ".cursor/rules/test-first.mdc"), "utf8");
    expect(body).toContain("INTERVIEW");
    expect(body).toContain("APPROVE");
    expect(body).toMatch(/RED[\s\S]*GREEN/);
    expect(body).toContain("RELIABILITY OVERRIDE");
  });

  it("dedupes shared AGENTS.md writes when several agents target it", () => {
    const root = tempRoot();
    const written = installSelected(
      root,
      [testFirst],
      [getAdapter("codex")!, getAdapter("opencode")!, getAdapter("antigravity")!],
    );
    expect(written.filter((p) => p === "AGENTS.md")).toHaveLength(1);
  });

  it("installs a drop-in fixture skill with no code change (criterion 6)", () => {
    const root = tempRoot();
    const fixtureSkills = loadSkills(resolve(here, "fixtures/skills"));
    const sample = fixtureSkills.find((s) => s.id === "sample-skill")!;
    installSelected(root, [sample], [getAdapter("claude")!]);
    const body = readFileSync(join(root, ".claude/skills/sample-skill/SKILL.md"), "utf8");
    expect(body).toContain("Sample body.");
  });
});
