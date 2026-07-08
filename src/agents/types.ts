import type { Skill } from "../skills/types.js";

/**
 * How an agent's file is written.
 * - `overwrite`: a file we own entirely (created/replaced wholesale).
 * - `inject`: a shared file that may hold user content — write a delimited block.
 */
export type WriteStrategy = "overwrite" | "inject";

/** Renders any skill into one agent's native format and location. */
export interface Adapter {
  /** stable id used for --agent and the picker */
  id: string;
  /** human label shown in the picker */
  label: string;
  /** how this agent's file is written */
  strategy: WriteStrategy;
  /** where the skill is written, relative to the target project root */
  outputPath(skill: Skill): string;
  /** wrap the canonical skill in this agent's native format */
  render(skill: Skill): string;
  /** heuristic: is this agent already used in the target project? */
  detect(projectRoot: string): boolean;
}
