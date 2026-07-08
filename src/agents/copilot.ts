import type { Skill } from "../skills/types.js";
import { anyExists } from "./shared.js";
import type { Adapter } from "./types.js";

/** GitHub Copilot — injected block in the repo instructions file. */
export const copilot: Adapter = {
  id: "copilot",
  label: "GitHub Copilot",
  strategy: "inject",
  outputPath: () => ".github/copilot-instructions.md",
  render: (skill: Skill) => skill.content,
  detect: (root: string) => anyExists(root, [".github/copilot-instructions.md"]),
};
