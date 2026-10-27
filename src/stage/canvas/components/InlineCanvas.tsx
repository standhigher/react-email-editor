import { buttonContent, buttonStyles } from "../../../render/button";
import { contentDefaults } from "../../../render/content-style";
import { readAlign } from "../../../render/align";
import { resolvedFontWeight, typographyStyle } from "../../../utils/style";
import type { EmailBlockNode, EmailGlobalSettings } from "../../../types/document";
import { RichText, type RichTextProps } from "../../rich-text/RichText";

interface InlineCanvasProps extends Omit<RichTextProps, "initialHtml" | "inherited" | "onCommit"> {
  block: EmailBlockNode;
  global: EmailGlobalSettings;
  onCommit: (html: string) => void;
}

export function InlineCanvas({ block, global, ...props }: InlineCanvasProps) {
  const button = props.profile === "button";
  const styles = buttonStyles(block, global);
  const typography = button ? styles.text : typographyStyle(block.style, global);
  const defaults = contentDefaults(block.style, global);
  const editor = (
    <RichText
      {...props}
      initialHtml={button ? buttonContent(block) : String(block.fields.html ?? "")}
      inherited={{
        fontFamily: String(typography.fontFamily),
        fontSize: String(typography.fontSize),
        color: String(typography.color),
        fontWeight: resolvedFontWeight(button ? undefined : block.style?.typography?.fontWeight, global.fontWeight),
        lineHeight: String(typography.lineHeight ?? ""),
        paragraphSpacing: defaults.paragraph,
        listSpacing: defaults.listSpacing,
        listIndent: defaults.listIndent,
        linkColor: defaults.linkColor,
        linkDecoration: defaults.linkDecoration,
      }}
    />
  );
  if (!button) return editor;
  const align = readAlign(styles.element.align);
  return (
    <table role="presentation" className="ree-button-canvas-row" cellPadding={0} cellSpacing={0}>
      <tbody><tr><td align={align}>
        <table role="presentation" align={align} cellPadding={0} cellSpacing={0} style={{ width: styles.width, maxWidth: "100%" }}>
          <tbody><tr><td style={{ ...styles.box, ...styles.text }}>{editor}</td></tr></tbody>
        </table>
      </td></tr></tbody>
    </table>
  );
}
