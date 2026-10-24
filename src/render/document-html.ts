import { DEFAULT_BLOCKS } from "../blocks/registry";
import { CANVAS_DEVICE_WIDTH, EMAIL_COLUMN_PADDING_X } from "../constants/editor";
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
  const body = document.blocks
    .map((node) => {
      const blockData = {
        ...(options.templateData ?? {}),
        ...node.defaultData,
      };
      return blockToHtml(node, definitions, "email", {
        resolveHtmlTemplate: options.resolveHtmlTemplates,
        templateData: mergeTemplateData(
          options.variables ?? [],
          Object.keys(blockData).length > 0 ? blockData : undefined,
        ),
      });
    })
    .join("\n");

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
    `<td align="center" style="padding:24px ${EMAIL_COLUMN_PADDING_X}px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:${CANVAS_DEVICE_WIDTH.desktop}px;background-color:#ffffff;">`,
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
