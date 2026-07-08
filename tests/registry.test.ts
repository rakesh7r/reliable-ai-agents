import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadSkills } from "../src/skills/registry.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = resolve(here, "fixtures/skills");
const realSkills = resolve(here, "../skills");

describe("loadSkills", () => {
  it("discovers a skill from its folder (skill.md + meta.json)", () => {
    const skills = loadSkills(fixtures);
    const sample = skills.find((s) => s.id === "sample-skill");
    expect(sample).toBeDefined();
    expect(sample?.title).toBe("Sample");
    expect(sample?.description).toBe("A sample skill.");
    expect(sample?.content).toContain("Sample body.");
  });

  it("ignores directories that are not skills (no meta.json/skill.md)", () => {
    const skills = loadSkills(fixtures);
    expect(skills.some((s) => s.id === "not-a-skill")).toBe(false);
  });

  it("returns skills sorted by id", () => {
    const skills = loadSkills(fixtures);
    const ids = skills.map((s) => s.id);
    expect(ids).toEqual([...ids].sort());
  });

  it("loads the real flagship tdd-reliability skill", () => {
    const skills = loadSkills(realSkills);
    const tdd = skills.find((s) => s.id === "tdd-reliability");
    expect(tdd).toBeDefined();
    expect(tdd?.content).toContain("TDD Reliability Harness");
  });

  it("resolves the bundled skills dir with no argument (defaultSkillsDir)", () => {
    const skills = loadSkills();
    expect(skills.some((s) => s.id === "tdd-reliability")).toBe(true);
  });
});
