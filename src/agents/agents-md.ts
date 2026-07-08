import { sharedFileAdapter } from "./shared.js";

/**
 * Agents that consume the shared AGENTS.md standard. They are distinct choices
 * in the picker but all inject into AGENTS.md; the installer dedupes writes by
 * (path, skill) so selecting several does not duplicate the block.
 */
export const codex = sharedFileAdapter("codex", "Codex", "AGENTS.md");
export const opencode = sharedFileAdapter("opencode", "OpenCode", "AGENTS.md");
// Antigravity's native format is unverified; AGENTS.md is the best-effort default.
export const antigravity = sharedFileAdapter("antigravity", "Antigravity CLI", "AGENTS.md");
