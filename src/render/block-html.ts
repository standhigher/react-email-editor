import { DEFAULT_BLOCKS } from "../blocks/registry";
import { DEFAULT_EMAIL_GLOBAL } from "../document/constants";
import { getBlockDefinition } from "../document/registry";
import { cssSpacing } from "../utils/css-values";
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

export function variablesToTemplateData(variables: Variable[]): TemplateData {
  const data: TemplateData = {};
  for (const variable of variables) {
    if (variable.value === undefined) continue;
    data[variable.name] = variable.value;
    const path = variable.name.split(".");
    if (path.length < 2) continue;
    let current = data;
    path.forEach((key, index) => {
      if (index === path.length - 1) {
        current[key] = variable.value;
        return;
      }
      const next = current[key];
      if (!next || typeof next !== "object" || Array.isArray(next)) {
        current[key] = {};
      }
      current = current[key] as TemplateData;
    });
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
  // getHtml 不传 resolveHtmlTemplate，Go template 原文保留。
  if (!normalizedOptions.resolveHtmlTemplate) {
    return rendered;
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
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td style="padding:${esc(cssSpacing(node.style?.dimension?.margin))};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr><td style="${blockCellCss(node.style, global)}">${inner}</td></tr></table></td></tr></table>`;
}
