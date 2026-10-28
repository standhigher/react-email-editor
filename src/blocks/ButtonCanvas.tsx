import { buttonStyles } from "../render/button";
import { readAlign } from "../render/align";
import { EditableRichText } from "../plugins/components/EditableRichText";
import type { PluginEditorProps } from "../plugins/types";

export function ButtonCanvas({ block, body }: Pick<PluginEditorProps, "block" | "body">) {
  const styles = buttonStyles(block, body);
  const align = readAlign(styles.element.align);
  return (
    <table role="presentation" className="ree-button-canvas-row" cellPadding={0} cellSpacing={0}>
      <tbody><tr><td align={align}>
        <table role="presentation" align={align} cellPadding={0} cellSpacing={0} style={{ width: styles.width, maxWidth: "100%" }}>
          <tbody><tr><td style={{ ...styles.box, ...styles.text }}><EditableRichText control="html" profile="button" /></td></tr></tbody>
        </table>
      </td></tr></tbody>
    </table>
  );
}
