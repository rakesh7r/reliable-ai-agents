import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Skill } from "./types.js";

interface SkillMeta {
  id: string;
  title: string;
  description: string;
  version?: string;
}

/**
 * Absolute path to the bundled `skills/` directory, resolved relative to this
 * module. Works from both `src/` (dev) and `dist/` (published), since `skills/`
 * ships alongside `dist/` at the package root.
 */
export function defaultSkillsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // dev: src/skills/ -> ../../skills ; published: dist/ -> ../skills
  const candidates = [resolve(here, "../../skills"), resolve(here, "../skills")];
  return candidates.find(dirExists) ?? candidates[0];
}

function dirExists(path: string): boolean {
  try {
    return readdirSync(path).length >= 0;
  } catch {
    return false;
  }
}

/**
 * Scan a skills directory and load every valid skill. A valid skill is a
 * subdirectory containing both `meta.json` and `skill.md`. Directories missing
 * either file are ignored, so dropping in a new skill folder requires no code
 * change. Results are sorted by id.
 */
export function loadSkills(skillsDir: string = defaultSkillsDir()): Skill[] {
  const entries = readdirSync(skillsDir, { withFileTypes: true });
  const skills: Skill[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(skillsDir, entry.name);
    const metaPath = join(dir, "meta.json");
    const contentPath = join(dir, "skill.md");

    let meta: SkillMeta;
    let content: string;
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf8")) as SkillMeta;
      content = readFileSync(contentPath, "utf8");
    } catch {
      continue; // not a skill directory
    }

    skills.push({
      id: meta.id,
      title: meta.title,
      description: meta.description,
      content,
    });
  }

  return skills.sort((a, b) => a.id.localeCompare(b.id));
}
