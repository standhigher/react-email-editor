import type { EmailBlockNode, EmailDocument } from "../types/document";

export function createEmailDocument(
  blocks: EmailBlockNode[] = [],
): EmailDocument {
  return { version: 1, blocks };
}

export function createEmptyDocument(): EmailDocument {
  return { version: 1, subject: "", blocks: [] };
}
