import { useEditorTranslation } from "../../../i18n/context";
import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import type { RichTextProfile } from "../../../types/block";
import { FONT_FAMILIES, fontFamilyLabel } from "../../../document/constants";
import { FONT_SIZES } from "../constants";
import { formatText, toggleVisualBold } from "../formatting";
import type { EditorTextRange, RichTextInheritedStyle, RichTextMenu, ToolbarState } from "../types";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarMenu } from "./ToolbarMenu";

interface TextFormatControlsProps {
  editor: Editor;
  profile: RichTextProfile;
  state: ToolbarState;
  inherited: RichTextInheritedStyle;
  menu: RichTextMenu | null;
  range: EditorTextRange | null;
  bold: boolean;
  toggleMenu: (next: RichTextMenu) => void;
  run: (command: () => void) => void;
  children: ReactNode;
}

export function TextFormatControls({ editor, profile, state, inherited, menu, range, bold, toggleMenu, run, children }: TextFormatControlsProps) {
  const t = useEditorTranslation();
  const fontFamily = state.fontFamily || inherited.fontFamily;
  const fontSize = state.fontSize || inherited.fontSize;
  return (
    <>
      <div className="ree-rte-group" role="group" aria-label={t("common.font")}>
        <ToolbarMenu
          title={t("common.font")}
          open={menu === "font"}
          onToggle={() => toggleMenu("font")}
          label={fontFamilyLabel(fontFamily)}
        >
          {FONT_FAMILIES.map((font) => (
            <button
              key={font.value}
              type="button"
              className={`ree-rte-option${fontFamily === font.value ? " is-active" : ""}`}
              style={{ fontFamily: font.value }}
              onClick={() =>
                run(() => formatText(editor, (chain) => chain.setFontFamily(font.value), range))
              }
            >
              {font.label}
            </button>
          ))}
        </ToolbarMenu>
        <ToolbarMenu
          title={t("common.fontSize")}
          open={menu === "size"}
          onToggle={() => toggleMenu("size")}
          label={fontSize || "15px"}
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`ree-rte-option${fontSize === size ? " is-active" : ""}`}
              onClick={() => run(() => formatText(editor, (chain) => chain.setFontSize(size), range))}
            >
              {size}
            </button>
          ))}
        </ToolbarMenu>
      </div>
      <div className="ree-rte-group" role="group" aria-label={t("toolbar.textStyle")}>
        <ToolbarButton
          title={t("common.bold")}
          active={bold}
          onClick={() => toggleVisualBold(editor, inherited.fontWeight)}
        >
          <span className="ree-tool-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          title={t("common.italic")}
          active={state.italic}
          onClick={() => formatText(editor, (chain) => chain.toggleItalic())}
        >
          <span className="ree-tool-italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title={t("common.underline")}
          active={state.underline}
          onClick={() => formatText(editor, (chain) => chain.toggleUnderline())}
        >
          <span className="ree-tool-underline">U</span>
        </ToolbarButton>
        {profile === "text" ? (
          <ToolbarButton
            title={t("toolbar.strikethrough")}
            active={state.strike}
            onClick={() => formatText(editor, (chain) => chain.toggleStrike())}
          >
            <span className="ree-tool-strike">S</span>
          </ToolbarButton>
        ) : null}
        {children}
      </div>
    </>
  );
}
