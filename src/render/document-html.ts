import { DEFAULT_BLOCKS } from "../blocks/registry";
import { surfaceStyle } from "./layout";
import { extractHeadStyles } from "./head-styles";
import { spacerHtml } from "./spacer";
import { ensureEmailDocument } from "../document/create-document";
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
  definitions: readonly BlockDefinition[] = DEFAULT_BLOCKS,
  options: DocumentHtmlOptions = {},
): string {
  const source = ensureEmailDocument(document);
  const body = source.body;
  const baseCss = emailBaseCss(body);
  const rendered = source.blocks
    .map((node, index) => {
      const blockData = {
        ...options.templateData,
        ...node.defaultData,
      };
      const block = blockToHtml(node, definitions, "email", {
        resolveHtmlTemplate: options.resolveHtmlTemplates,
        body,
        variables: options.variables,
        templateData: mergeTemplateData(
          options.variables ?? [],
          Object.keys(blockData).length > 0 ? blockData : undefined,
        ),
      });
      const gap = index < source.blocks.length - 1 ? spacerHtml(body.blockGap) : "";
      return block + gap;
    })
    .join("\n");
  const { html: content, styles } = extractHeadStyles(rendered);

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "<title>Email</title>",
    styles,
    "</head>",
    `<body style="margin:0;padding:0;${baseCss};background-color:#ffffff;word-spacing:normal;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${baseCss};background-color:#ffffff;table-layout:fixed;">`,
    "<tr>",
    `<td align="center" style="padding:0;${baseCss};">`,
    `<table role="presentation" align="center" width="${body.contentWidth}" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${body.contentWidth}px;margin-left:auto;margin-right:auto;table-layout:fixed;">`,
    "<tr>",
    `<td style="box-sizing:border-box;${styleToCss(surfaceStyle(body))};">`,
    content,
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
