import type { Skill } from "../skills/types.js";
import { anyExists } from "./shared.js";
import type { Adapter } from "./types.js";

/** Kiro IDE & CLI — steering file. */
export const kiro: Adapter = {
  id: "kiro",
  label: "Kiro IDE & CLI",
  strategy: "overwrite",
  outputPath: (skill: Skill) => `.kiro/steering/${skill.id}.md`,
  render: (skill: Skill) => `${skill.content}\n`,
  detect: (root: string) => anyExists(root, [".kiro"]),
};
