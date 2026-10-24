import { DEFAULT_BLOCKS } from "../blocks/registry";
import { getBlockDefinition } from "../document/registry";
import { blockCellCss } from "../utils/style";
import { buildRenderContext } from "./context";
import { renderTemplatePreview } from "./template-preview";
import type { BlockDefinition, RenderMode, Variable } from "../types/block";
import type { EmailBlockNode } from "../types/document";
import type { TemplateData } from "./template-preview";

export interface BlockRenderOptions {
  resolveHtmlTemplate?: boolean;
  templateData?: TemplateData;
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
  const rendered = renderBlock(node, definitions, mode);
  if (!normalizedOptions.resolveHtmlTemplate || node.type !== "html") {
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
): string {
  const definition = getBlockDefinition(node.type, definitions);
  return definition
    ? definition.render(buildRenderContext(node, mode))
    : `<!-- unknown block type: ${node.type} -->`;
}

export function blockToHtml(
  node: EmailBlockNode,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  mode: RenderMode = "email",
  options: BlockRenderOptionsInput = {},
): string {
  const inner = renderBlockContent(node, definitions, mode, options);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockCellCss(node.style)}">${inner}</td></tr></table>`;
}
