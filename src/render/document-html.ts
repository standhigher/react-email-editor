import { DEFAULT_BLOCKS } from "../blocks/registry";
import { surfaceStyle } from "./layout";
import { extractHeadStyles } from "./head-styles";
import { spacerHtml } from "./spacer";
import { ensureEmailDocument } from "../document/create-document";
import { esc } from "../utils/html";
import { emailBaseCss, styleToCss } from "../utils/style";
import {
  blockToHtml,
  mergeTemplateData,
} from "./block-html";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailDocument } from "../types/document";
import type { TemplateData } from "./template-preview";

export interface DocumentHtmlOptions {
  resolveHtmlTemplates?: boolean;
  variables?: Variable[];
  templateData?: TemplateData;
}

export function documentToHtml(
  document: EmailDocument,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
  options: DocumentHtmlOptions = {},
): string {
  const source = ensureEmailDocument(document);
  const global = source.global;
  const baseCss = emailBaseCss(global);
  const rendered = source.blocks
    .map((node, index) => {
      const blockData = {
        ...options.templateData,
        ...node.defaultData,
      };
      const block = blockToHtml(node, definitions, "email", {
        resolveHtmlTemplate: options.resolveHtmlTemplates,
        global,
        variables: options.variables,
        templateData: mergeTemplateData(
          options.variables ?? [],
          Object.keys(blockData).length > 0 ? blockData : undefined,
        ),
      });
      const gap = index < source.blocks.length - 1 ? spacerHtml(global.blockGap) : "";
      return block + gap;
    })
    .join("\n");
  const { html: body, styles } = extractHeadStyles(rendered);

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "<title>Email</title>",
    styles,
    "</head>",
    `<body style="margin:0;padding:0;${baseCss};background-color:${esc(global.backgroundColor)};word-spacing:normal;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${baseCss};background-color:${esc(global.backgroundColor)};table-layout:fixed;">`,
    "<tr>",
    `<td align="${esc(global.contentAlign)}" style="padding:${esc(global.outerPadding)};${baseCss};">`,
    `<table role="presentation" align="${esc(global.contentAlign)}" width="${global.contentWidth}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${global.contentWidth}px;margin-left:${global.contentAlign === "left" ? "0" : "auto"};margin-right:${global.contentAlign === "right" ? "0" : "auto"};table-layout:fixed;">`,
    "<tr>",
    `<td style="box-sizing:border-box;${baseCss};${styleToCss(surfaceStyle(global))};">`,
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
