import { antigravity, codex, opencode } from "./agents-md.js";
import { claude } from "./claude.js";
import { copilot } from "./copilot.js";
import { cursor } from "./cursor.js";
import { gemini } from "./gemini.js";
import { kiro } from "./kiro.js";
import type { Adapter } from "./types.js";
import { windsurf } from "./windsurf.js";

/** All supported agent adapters. Claude Code is the reference target. */
export const adapters: Adapter[] = [
  claude,
  cursor,
  windsurf,
  kiro,
  gemini,
  copilot,
  codex,
  opencode,
  antigravity,
];

/** Look up an adapter by its id. */
export function getAdapter(id: string): Adapter | undefined {
  return adapters.find((a) => a.id === id);
}

export type { Adapter } from "./types.js";
