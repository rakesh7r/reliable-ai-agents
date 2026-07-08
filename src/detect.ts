import { adapters } from "./agents/index.js";

/**
 * Detect which supported agents a project already uses, by each adapter's native
 * marker. Returns their ids; falls back to `["claude"]` when none are detected so
 * the picker has a sensible default.
 */
export function detectAgents(projectRoot: string): string[] {
  const found = adapters.filter((a) => a.detect(projectRoot)).map((a) => a.id);
  return found.length > 0 ? found : ["claude"];
}
