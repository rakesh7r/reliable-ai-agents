import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as p from "@clack/prompts";
import { adapters, getAdapter } from "../agents/index.js";
import type { Adapter } from "../agents/types.js";
import { detectAgents } from "../detect.js";
import { injectBlock } from "../fs/inject.js";
import { loadSkills } from "../skills/registry.js";
import type { Skill } from "../skills/types.js";

/** Marker used to fence a skill's block in shared instruction files. */
function markerFor(skill: Skill): string {
  return `reliable-ai-agents:${skill.id}`;
}

function readIfExists(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function writeFile(absPath: string, content: string): void {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content);
}

/**
 * Install the selected skills into the selected agents under `projectRoot`.
 *
 * - `overwrite` adapters write a file we own wholesale.
 * - `inject` adapters merge a per-skill block into a shared file, preserving all
 *   other content (idempotent).
 *
 * Writes to the same (path, skill) pair are deduped so several agents that share
 * a file (e.g. AGENTS.md) don't inject the same block repeatedly.
 *
 * Returns the project-relative paths that were written.
 */
export function installSelected(
  projectRoot: string,
  skills: Skill[],
  selected: Adapter[],
): string[] {
  const written: string[] = [];
  const seen = new Set<string>();

  for (const skill of skills) {
    for (const adapter of selected) {
      const rel = adapter.outputPath(skill);
      const key = `${rel}::${skill.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const abs = join(projectRoot, rel);
      const rendered = adapter.render(skill);

      if (adapter.strategy === "inject") {
        const merged = injectBlock(readIfExists(abs), rendered, markerFor(skill));
        writeFile(abs, merged);
      } else {
        writeFile(abs, rendered);
      }

      written.push(rel);
    }
  }

  return written;
}

export interface InitOptions {
  cwd: string;
  /** skill ids from --skill flags; empty = ask interactively */
  skills: string[];
  /** agent ids from --agent flags; empty = ask interactively */
  agents: string[];
}

function fail(message: string): never {
  p.cancel(message);
  process.exit(1);
}

/** Drive the `init` command: resolve selections (flags or prompts), then install. */
export async function runInit(opts: InitOptions): Promise<void> {
  p.intro("reliable-ai-agents");

  const allSkills = loadSkills();
  if (allSkills.length === 0) fail("No skills found in the registry.");

  const skills = await resolveSkills(allSkills, opts.skills);
  const selected = await resolveAgents(opts.cwd, opts.agents);

  const written = installSelected(opts.cwd, skills, selected);
  p.outro(
    `Installed ${skills.length} skill(s) into ${selected.length} agent(s):\n` +
      written.map((w) => `  • ${w}`).join("\n"),
  );
}

async function resolveSkills(all: Skill[], ids: string[]): Promise<Skill[]> {
  if (ids.length > 0) {
    return ids.map((id) => {
      const skill = all.find((s) => s.id === id);
      if (!skill) fail(`Unknown skill: ${id}`);
      return skill;
    });
  }
  if (all.length === 1) return all;

  const picked = await p.multiselect({
    message: "Which skills do you want to install?",
    options: all.map((s) => ({ value: s.id, label: s.title, hint: s.description })),
    initialValues: all.map((s) => s.id),
  });
  if (p.isCancel(picked)) fail("Cancelled.");
  return (picked as string[]).map((id) => all.find((s) => s.id === id) as Skill);
}

async function resolveAgents(cwd: string, ids: string[]): Promise<Adapter[]> {
  if (ids.length > 0) {
    return ids.map((id) => {
      const adapter = getAdapter(id);
      if (!adapter) fail(`Unknown agent: ${id}`);
      return adapter;
    });
  }

  const detected = detectAgents(cwd);
  const picked = await p.multiselect({
    message: "Which agents do you want to install into?",
    options: adapters.map((a) => ({ value: a.id, label: a.label })),
    initialValues: detected,
  });
  if (p.isCancel(picked)) fail("Cancelled.");
  return (picked as string[]).map((id) => getAdapter(id) as Adapter);
}
