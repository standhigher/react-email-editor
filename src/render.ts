import { blockCellCss } from "./blocks";
import { DEFAULT_BLOCKS } from "./blocks";
import type {
  BlockDefinition,
  BlockRenderContext,
  EmailBlockNode,
  EmailDocument,
} from "./types";

export type RenderMode = "canvas" | "email";

export function getBlockDefinition(
  type: string,
  defs: BlockDefinition[] = DEFAULT_BLOCKS,
): BlockDefinition | undefined {
  return defs.find((d) => d.type === type);
}

/** 由节点构造渲染上下文（style 缺失时兜底为空对象，保证 ctx.style 恒可用）。 */
export function buildRenderContext(
  node: EmailBlockNode,
  mode: RenderMode,
): BlockRenderContext {
  return {
    block: node,
    fields: node.fields ?? {},
    style: node.style ?? {},
    mode,
  };
}

/** 渲染单个区块的内部 HTML 片段（不含外层 table 行包装）。 */
export function renderBlock(
  node: EmailBlockNode,
  defs: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
): string {
  const def = getBlockDefinition(node.type, defs);
  return def
    ? def.render(buildRenderContext(node, mode))
    : `<!-- unknown block type: ${node.type} -->`;
}

/** 把单个区块渲染成邮件的整行（table row）。 */
export function blockToHtml(
  node: EmailBlockNode,
  defs: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
): string {
  const inner = renderBlock(node, defs, mode);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockCellCss(node.style)}">${inner}</td></tr></table>`;
}

/** 把整份文档渲染成可投递的邮件 HTML（table 布局 + 内联样式，email 模式）。 */
export function documentToHtml(
  document: EmailDocument,
  defs: BlockDefinition[] = DEFAULT_BLOCKS,
): string {
  const body = document.blocks.map((n) => blockToHtml(n, defs, "email")).join("\n");

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "<title>Email</title>",
    "</head>",
    '<body style="margin:0;padding:0;background-color:#f4f5f7;word-spacing:normal;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7;">',
    "<tr>",
    '<td align="center" style="padding:24px 12px;">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;">',
    "<tr>",
    '<td style="padding:0;">',
    body,
    "</td>",
    "</tr>",
    "</table>",
    "</td>",
    "</tr>",
    "</table>",
    "</body>",
    "</html>",
  ].join("\n");
}

/** 创建一个带默认区块的空文档。 */
export function createEmailDocument(
  blocks: EmailBlockNode[] = [],
): EmailDocument {
  return { version: 1, blocks };
}

/** 生成唯一 id（浏览器 + 兜底）。 */
export function generateId(prefix = "block"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 根据区块定义创建新节点。 */
export function createBlockNode(
  type: string,
  defs: BlockDefinition[] = DEFAULT_BLOCKS,
): EmailBlockNode | null {
  const def = getBlockDefinition(type, defs);
  if (!def) return null;
  const fields: Record<string, unknown> = { ...(def.defaultFields ?? {}) };
  for (const f of def.fields ?? []) {
    if (!(f.name in fields) && f.defaultValue !== undefined) {
      fields[f.name] = f.defaultValue;
    }
  }
  if (def.inlineEdit && !("html" in fields)) {
    fields.html = "<p></p>";
  }
  return {
    id: generateId(type),
    type,
    fields,
    style: def.defaultStyle ? structuredClone(def.defaultStyle) : undefined,
  };
}
