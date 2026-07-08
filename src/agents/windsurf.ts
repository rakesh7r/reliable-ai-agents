import type { Skill } from "../skills/types.js";
import { anyExists } from "./shared.js";
import type { Adapter } from "./types.js";

/** Windsurf — rule file in the rules directory. */
export const windsurf: Adapter = {
  id: "windsurf",
  label: "Windsurf",
  strategy: "overwrite",
  outputPath: (skill: Skill) => `.windsurf/rules/${skill.id}.md`,
  render: (skill: Skill) => `${skill.content}\n`,
  detect: (root: string) => anyExists(root, [".windsurf", ".windsurfrules"]),
};
