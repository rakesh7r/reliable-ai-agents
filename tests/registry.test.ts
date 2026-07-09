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

  it("loads the real flagship test-first skill", () => {
    const skills = loadSkills(realSkills);
    const testFirst = skills.find((s) => s.id === "test-first");
    expect(testFirst).toBeDefined();
    expect(testFirst?.content).toContain("Test-First");
  });

  it("loads the plan-first skill", () => {
    const skills = loadSkills(realSkills);
    const planFirst = skills.find((s) => s.id === "plan-first");
    expect(planFirst).toBeDefined();
    expect(planFirst?.content).toContain("Plan-First");
  });

  it("resolves the bundled skills dir with no argument (defaultSkillsDir)", () => {
    const skills = loadSkills();
    expect(skills.some((s) => s.id === "test-first")).toBe(true);
  });
});
