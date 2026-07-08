import type { Skill } from "../skills/types.js";
import { anyExists } from "./shared.js";
import type { Adapter } from "./types.js";

/** Gemini CLI — injected block in GEMINI.md. */
export const gemini: Adapter = {
  id: "gemini",
  label: "Gemini CLI",
  strategy: "inject",
  outputPath: () => "GEMINI.md",
  render: (skill: Skill) => skill.content,
  detect: (root: string) => anyExists(root, ["GEMINI.md", ".gemini"]),
};
