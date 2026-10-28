export const BLOCK_TYPES = {
  heading: "heading",
  text: "text",
  button: "button",
  image: "image",
  divider: "divider",
  spacer: "spacer",
  html: "html",
} as const;

/** Union of builtin block type identifiers. */
export type BuiltinBlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];
