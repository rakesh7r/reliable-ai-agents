import type { Skill } from "../skills/types.js";
import { anyExists, withFrontmatter } from "./shared.js";
import type { Adapter } from "./types.js";

/** Claude Code — project-local skill with SKILL.md frontmatter. Reference target. */
export const claude: Adapter = {
  id: "claude",
  label: "Claude Code (recommended)",
  strategy: "overwrite",
  outputPath: (skill: Skill) => `.claude/skills/${skill.id}/SKILL.md`,
  render: (skill: Skill) =>
    withFrontmatter({ name: skill.id, description: skill.description }, skill.content),
  detect: (root: string) => anyExists(root, [".claude", "CLAUDE.md"]),
};
