import { DEFAULT_BLOCKS } from "../blocks/registry";
import { DEFAULT_EMAIL_GLOBAL } from "../document/constants";
import { getBlockDefinition } from "../document/registry";
import { cssPx, cssSpacing } from "../utils/css-values";
import { esc } from "../utils/html";
import { blockCellCss } from "../utils/style";
import { buildRenderContext } from "./context";
import { renderTemplatePreview } from "./template-preview";
import type { BlockDefinition, RenderMode, Variable } from "../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../types/document";
import type { TemplateData } from "./template-preview";

export interface BlockRenderOptions {
  resolveHtmlTemplate?: boolean;
  templateData?: TemplateData;
  variables?: Variable[];
  global?: EmailGlobalSettings;
}

type BlockRenderOptionsInput = BlockRenderOptions | boolean;

function normalizeBlockRenderOptions(
  options: BlockRenderOptionsInput,
): BlockRenderOptions {
  return typeof options === "boolean"
    ? { resolveHtmlTemplate: options }
    : options;
}

const LISTED_TOKEN = /^(\{\{-?)([\s\S]*?)(-?\}\})$/;

function variableFieldName(name: string): string | null {
  const token = /^\{\{-?\s*([\s\S]*?)\s*-?\}\}$/.exec(name.trim());
  const inner = (token ? token[1] : name).trim();
  const field = inner.startsWith(".") ? inner.slice(1) : inner;
  if (!field || !/^[A-Za-z_][\w.]*$/.test(field)) return null;
  return field;
}

function dottedListedToken(name: string): string | null {
  const match = LISTED_TOKEN.exec(name);
  if (!match) return null;
  const [, open, raw, close] = match;
  const field = variableFieldName(name);
  if (!field || raw.trim().startsWith(".")) return null;
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

function assignTemplateField(data: TemplateData, field: string, value: string) {
  const parts = field.split(".");
  if (parts.length === 1) {
    data[field] = value;
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

/** 用变量 name 里的字段名作为键，value 作为预览替换值。 */
export function variablesToTemplateData(variables: Variable[]): TemplateData {
  const data: TemplateData = {};
  for (const variable of variables) {
    if (variable.value === undefined) continue;
    const field = variableFieldName(variable.name);
    if (!field) continue;
    assignTemplateField(data, field, variable.value);
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
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  options: BlockRenderOptionsInput = {},
): string {
  const normalizedOptions = normalizeBlockRenderOptions(options);
  const rendered = renderBlock(
    node,
    definitions,
    mode,
    normalizedOptions.global ?? DEFAULT_EMAIL_GLOBAL,
  );
  // 预览展开作用于每个区块 render 产出的 HTML，不限于 HTML 区块。
  // 导出不替换 value，只给变量列表中的原文补点。
  if (!normalizedOptions.resolveHtmlTemplate) {
    return applyListedVariableDots(rendered, normalizedOptions.variables ?? []);
  }
  return renderTemplatePreview(
    rendered,
    normalizedOptions.templateData ?? node.defaultData,
  );
}

export function renderBlock(
  node: EmailBlockNode,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  global: EmailGlobalSettings = DEFAULT_EMAIL_GLOBAL,
): string {
  const definition = getBlockDefinition(node.type, definitions);
  return definition
    ? definition.render(buildRenderContext(node, mode, global))
    : `<!-- unknown block type: ${node.type} -->`;
}

export function blockToHtml(
  node: EmailBlockNode,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  options: BlockRenderOptionsInput = {},
): string {
  const normalizedOptions = normalizeBlockRenderOptions(options);
  const global = normalizedOptions.global ?? DEFAULT_EMAIL_GLOBAL;
  const inner = renderBlockContent(node, definitions, mode, {
    ...normalizedOptions,
    global,
  });
  const height = cssPx(node.style?.dimension?.height);
  const cellAttrs = height ? ` height="${esc(height)}" valign="top"` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td style="padding:${esc(cssSpacing(node.style?.dimension?.margin))};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td${cellAttrs} style="${blockCellCss(node.style, global)}">${inner}</td></tr></table></td></tr></table>`;
}
