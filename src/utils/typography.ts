import { DEFAULT_TYPOGRAPHY } from "../constants/typography";
import { cssFont } from "./css-values";
import type { EmailBodySettings, EmailTypographyStyle } from "../types/document";

/** 主体中可编辑的默认值覆盖内部基础排版。 */
export function typographyWithBody(body?: EmailBodySettings): Required<EmailTypographyStyle> {
  return {
    ...DEFAULT_TYPOGRAPHY,
    ...(body ? {
      color: body.textColor,
      fontFamily: cssFont(body.fontFamily, DEFAULT_TYPOGRAPHY.fontFamily),
      fontWeight: body.fontWeight,
      linkColor: body.linkColor,
      linkDecoration: body.linkDecoration,
    } : {}),
  };
}
