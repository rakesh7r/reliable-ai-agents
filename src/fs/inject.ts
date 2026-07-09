/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Insert or update a delimited block of content within an existing document.
 *
 * The block is fenced by per-marker HTML comments so that:
 * - re-running with the same content is a no-op (idempotent),
 * - re-running with new content replaces only this marker's block in place,
 * - other markers' blocks and all surrounding user content are preserved.
 *
 * @param existing  current file contents ("" if the file does not exist)
 * @param content   the block body to inject
 * @param marker    unique marker, e.g. "reliable-ai-agents:test-first"
 */
export function injectBlock(existing: string, content: string, marker: string): string {
  const start = `<!-- ${marker}:start -->`;
  const end = `<!-- ${marker}:end -->`;
  const block = `${start}\n${content}\n${end}`;

  const re = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (re.test(existing)) {
    return existing.replace(re, block);
  }

  return existing.trim() ? `${existing.trimEnd()}\n\n${block}\n` : `${block}\n`;
}
