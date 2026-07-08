/** A reliability skill resolved from the `skills/` registry. */
export interface Skill {
  /** stable slug, from meta.json; used in filenames and --skill flags */
  id: string;
  /** human-readable title */
  title: string;
  /** one-line summary shown in the picker */
  description: string;
  /** canonical skill.md body, rendered into each agent */
  content: string;
}
