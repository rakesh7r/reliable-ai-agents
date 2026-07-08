import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Skill } from "../skills/types.js";
import type { Adapter } from "./types.js";

/** True if any of the given project-relative paths exists under root. */
export function anyExists(root: string, paths: string[]): boolean {
  return paths.some((p) => existsSync(join(root, p)));
}

/** YAML frontmatter block from key/value pairs, followed by the skill content. */
export function withFrontmatter(fields: Record<string, string>, content: string): string {
  const body = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `---\n${body}\n---\n\n${content}\n`;
}

/**
 * Adapter for a shared instructions file (AGENTS.md-style): inject strategy,
 * fixed path, renders the raw skill content as the block body.
 */
export function sharedFileAdapter(id: string, label: string, file: string): Adapter {
  return {
    id,
    label,
    strategy: "inject",
    outputPath: () => file,
    render: (skill: Skill) => skill.content,
    detect: (root: string) => anyExists(root, [file]),
  };
}
