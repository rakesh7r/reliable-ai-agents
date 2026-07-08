import type { Skill } from "../skills/types.js";
import { anyExists, withFrontmatter } from "./shared.js";
import type { Adapter } from "./types.js";

/** Cursor — always-applied rule as a `.mdc` file with frontmatter. */
export const cursor: Adapter = {
  id: "cursor",
  label: "Cursor",
  strategy: "overwrite",
  outputPath: (skill: Skill) => `.cursor/rules/${skill.id}.mdc`,
  render: (skill: Skill) =>
    withFrontmatter({ description: skill.description, alwaysApply: "true" }, skill.content),
  detect: (root: string) => anyExists(root, [".cursor", ".cursorrules"]),
};
