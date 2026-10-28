import { generateId } from "../utils/id";
import { writeStyleValue } from "../utils/style";
import { mergeEmailBody } from "./create-document";
import type {
  EmailBlockNode,
  EmailDocument,
  EmailBodySettings,
} from "../types/document";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

export function insertBlockNode(
  document: EmailDocument,
  node: EmailBlockNode,
  index?: number,
): EmailDocument {
  const blocks = [...document.blocks];
  const at = index ?? blocks.length;
  blocks.splice(Math.max(0, Math.min(at, blocks.length)), 0, node);
  return { ...document, blocks };
}

export function updateBlockField(
  document: EmailDocument,
  id: string,
  name: string,
  value: unknown,
): EmailDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.id === id
        ? { ...block, fields: { ...block.fields, [name]: value } }
        : block,
    ),
  };
}

export function updateBlockStyle(
  document: EmailDocument,
  id: string,
  styleId: string,
  value: string,
): EmailDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.id === id
        ? { ...block, style: writeStyleValue(block.style, styleId, value) }
        : block,
    ),
  };
}

export function moveBlockBy(
  document: EmailDocument,
  id: string,
  direction: -1 | 1,
): EmailDocument {
  const index = document.blocks.findIndex((block) => block.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= document.blocks.length) return document;
  return { ...document, blocks: moveItem(document.blocks, index, target) };
}

export function duplicateBlockNode(
  document: EmailDocument,
  id: string,
): EmailDocument {
  const index = document.blocks.findIndex((block) => block.id === id);
  if (index < 0) return document;
  const source = document.blocks[index];
  const copy: EmailBlockNode = {
    ...structuredClone(source),
    id: generateId(source.type),
  };
  const blocks = [...document.blocks];
  blocks.splice(index + 1, 0, copy);
  return { ...document, blocks };
}

export function removeBlockNode(
  document: EmailDocument,
  id: string,
): EmailDocument {
  return {
    ...document,
    blocks: document.blocks.filter((block) => block.id !== id),
  };
}

export function reorderBlockNodes(
  document: EmailDocument,
  activeId: string,
  overId: string,
): EmailDocument {
  if (activeId === overId) return document;
  const oldIndex = document.blocks.findIndex((block) => block.id === activeId);
  const newIndex = document.blocks.findIndex((block) => block.id === overId);
  if (oldIndex < 0 || newIndex < 0) return document;
  return { ...document, blocks: moveItem(document.blocks, oldIndex, newIndex) };
}

export function withSubject(
  document: EmailDocument,
  subject: string,
): EmailDocument {
  return { ...document, subject };
}

export function updateBodySettings(
  document: EmailDocument,
  patch: Partial<EmailBodySettings>,
): EmailDocument {
  return {
    ...document,
    body: mergeEmailBody(document.body, patch),
  };
}
