import { DEFAULT_BLOCKS } from "../blocks/registry";
import { DEFAULT_EMAIL_BODY } from "../document/constants";
import { getBlockDefinition } from "../document/registry";
import { resolveBlockStyle } from "../document/block-style";
import { cssPx, cssSpacing } from "../utils/css-values";
import { esc } from "../utils/html";
import { blockCellCss } from "../utils/style";
import { buildRenderContext } from "./context";
import { renderTemplatePreview } from "./template-preview";
import type { BlockDefinition, BlockRenderContext, RenderMode, Variable } from "../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../types/document";
import type { TemplateData } from "./template-preview";

/** Single-block rendering options; must be an object. */
export interface BlockRenderOptions {
  /** Resolve templates, default false; single-block rendering does not auto-merge variables. */
  resolveHtmlTemplate?: boolean;
  /** Explicit preview data; defaults to node defaultData. */
  templateData?: TemplateData;
  /** Exact token dot normalization on export; merge preview data explicitly. */
  variables?: Variable[];
  /** Body defaults; defaults to DEFAULT_EMAIL_BODY. */
  body?: EmailBodySettings;
}

function assertBlockRenderOptions(options: BlockRenderOptions): void {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Block render options must be an object.");
  }
}

function renderPreparedBlock(context: BlockRenderContext, definition: BlockDefinition): string {
  try {
    return definition.renderEmail(context);
  } catch (error) {
    const node = context.block;
    throw new Error(`Block ${node.type} (${node.id}) failed to render: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

/** 画布复用同一份归一化上下文，避免为 HTML 和 React 编辑区域重复解析字段。 */
export function renderBlockContentFromContext(context: BlockRenderContext, definition: BlockDefinition, options: BlockRenderOptions): string {
  return resolveBlockContent(renderPreparedBlock(structuredClone(context), definition), context.block, options);
}

const LISTED_TOKEN = /^(\{\{-?)([\s\S]*?)(-?\}\})$/;

function variableControlName(name: string): string | null {
  const token = /^\{\{-?\s*([\s\S]*?)\s*-?\}\}$/.exec(name.trim());
  const inner = (token ? token[1] : name).trim();
  const control = inner.startsWith(".") ? inner.slice(1) : inner;
  if (!control || !/^[A-Za-z_][\w.]*$/.test(control)) return null;
  return control;
}

function dottedListedToken(name: string): string | null {
  const match = LISTED_TOKEN.exec(name);
  if (!match) return null;
  const [, open, raw, close] = match;
  const control = variableControlName(name);
  if (!control || raw.trim().startsWith(".")) return null;
  const start = raw.search(/\S/);
  if (start < 0) return null;
  const dotted = `${open}${raw.slice(0, start)}.${raw.slice(start)}${close}`;
  return dotted === name ? null : dotted;
}

/** 只把变量列表里的原文补成带点字段，保留空格和 {{- -}}。列表外的模板不改。 */
function applyListedVariableDots(html: string, variables: Variable[]): string {
  const replacements = variables
    .map((variable) => ({ from: variable.name, to: dottedListedToken(variable.name) }))
    .filter((item): item is { from: string; to: string } => item.to != null)
    .sort((left, right) => right.from.length - left.from.length);
  return replacements.reduce(
    (current, item) => current.split(item.from).join(item.to),
    html,
  );
}

function assignTemplateControl(data: TemplateData, control: string, value: string) {
  const parts = control.split(".");
  if (parts.length === 1) {
    data[control] = value;
    return;
  }
  let current = data;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    const next = current[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) current[key] = {};
    current = current[key] as TemplateData;
  }
  current[parts[parts.length - 1]] = value;
}

/** Convert variable name paths and preview values into template data. */
export function variablesToTemplateData(variables: Variable[]): TemplateData {
  const data: TemplateData = {};
  for (const variable of variables) {
    if (variable.value === undefined) continue;
    const control = variableControlName(variable.name);
    if (!control) continue;
    assignTemplateControl(data, control, variable.value);
  }
  return data;
}

export function mergeTemplateData(
  variables: Variable[],
  defaultData?: TemplateData,
): TemplateData | undefined {
  const globalData = variablesToTemplateData(variables);
  if (Object.keys(globalData).length === 0 && defaultData === undefined) {
    return undefined;
  }
  return { ...globalData, ...defaultData };
}

export function renderBlockContent(
  node: EmailBlockNode,
  definitions: readonly BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  options: BlockRenderOptions = {},
): string {
  assertBlockRenderOptions(options);
  const rendered = renderBlock(
    node,
    definitions,
    mode,
    options.body ?? DEFAULT_EMAIL_BODY,
  );
  return resolveBlockContent(rendered, node, options);
}

function resolveBlockContent(rendered: string, node: EmailBlockNode, options: BlockRenderOptions): string {
  // 预览展开作用于每个区块 render 产出的 HTML，不限于 HTML 区块。
  // 导出不替换 value，只给变量列表中的原文补点。
  if (!options.resolveHtmlTemplate) {
    return applyListedVariableDots(rendered, options.variables ?? []);
  }
  return renderTemplatePreview(
    rendered,
    options.templateData ?? node.defaultData,
  );
}

export function renderBlock(
  node: EmailBlockNode,
  definitions: readonly BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  body: EmailBodySettings = DEFAULT_EMAIL_BODY,
): string {
  const definition = getBlockDefinition(node.type, definitions);
  if (!definition) throw new Error(`Missing block plugin: ${node.type}`);
  try {
    return definition.renderEmail(buildRenderContext(node, mode, body, definition));
  } catch (error) {
    throw new Error(`Block ${node.type} (${node.id}) failed to render: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

export function blockToHtml(
  node: EmailBlockNode,
  definitions: readonly BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  options: BlockRenderOptions = {},
): string {
  assertBlockRenderOptions(options);
  const body = options.body ?? DEFAULT_EMAIL_BODY;
  const style = resolveBlockStyle(node.style, getBlockDefinition(node.type, definitions));
  const inner = renderBlockContent(node, definitions, mode, {
    ...options,
    body,
  });
  const height = cssPx(style.dimension?.height);
  const cellAttrs = height ? ` height="${esc(height)}" valign="top"` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td style="padding:${esc(cssSpacing(style.dimension?.margin))};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td${cellAttrs} style="${blockCellCss(style, body)}">${inner}</td></tr></table></td></tr></table>`;
}
