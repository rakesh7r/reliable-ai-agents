import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { detectAgents } from "../src/detect.js";

function tempRoot(): string {
  return mkdtempSync(join(tmpdir(), "rae-detectagents-"));
}

describe("detectAgents", () => {
  it("returns the ids of agents whose markers are present", () => {
    const root = tempRoot();
    mkdirSync(join(root, ".cursor"), { recursive: true });
    const ids = detectAgents(root);
    expect(ids).toContain("cursor");
  });

  it("defaults to Claude Code when nothing is detected", () => {
    const root = tempRoot();
    expect(detectAgents(root)).toEqual(["claude"]);
  });

  it("does not duplicate ids when multiple markers map to the same agent", () => {
    const root = tempRoot();
    mkdirSync(join(root, ".claude"), { recursive: true });
    const ids = detectAgents(root);
    expect(ids.filter((id) => id === "claude")).toHaveLength(1);
  });
});
