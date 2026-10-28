import { typographyWithBody } from "../utils/typography";

import type { EmailBodySettings } from "../types/document";

export interface StyleResetState {
  resetTo: string;
  show: boolean;
}

/** 排版项重置为继承主体默认排版；其余项写回区块默认，避免删掉后落到透明或 0。 */
export function styleReset(stored: string, restore: string, inherit: boolean): StyleResetState {
  if (inherit) return { resetTo: "", show: stored !== "" };
  return { resetTo: restore, show: stored !== "" && stored !== restore };
}

export function inheritedStyleValue(id: string, body: EmailBodySettings): string | undefined {
  if (!id.startsWith("typography.") && !id.startsWith("element.")) return;
  const defaults = typographyWithBody(body);
  switch (id.split(".")[1]) {
    case "fontFamily": return defaults.fontFamily;
    case "fontSize": return defaults.fontSize;
    case "fontWeight": return defaults.fontWeight;
    case "lineHeight": return defaults.lineHeight;
    case "color": return defaults.color;
    case "textAlign": return defaults.textAlign;
    case "paragraphSpacing": return defaults.paragraphSpacing;
    case "listSpacing": return defaults.listSpacing;
    case "listIndent": return defaults.listIndent;
    case "linkColor": return defaults.linkColor;
    case "linkDecoration": return defaults.linkDecoration;
  }
}
