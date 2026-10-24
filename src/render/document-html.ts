import { DEFAULT_BLOCKS } from "../blocks/registry";
import { blockToHtml } from "./block-html";
import type { BlockDefinition } from "../types/block";
import type { EmailDocument } from "../types/document";

export function documentToHtml(
  document: EmailDocument,
  definitions: BlockDefinition[] = DEFAULT_BLOCKS,
): string {
  const body = document.blocks
    .map((node) => blockToHtml(node, definitions, "email"))
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
