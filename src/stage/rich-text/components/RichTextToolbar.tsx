import { useEffect, useRef, useState, type RefObject } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { FONT_FAMILIES, fontFamilyLabel } from "../../../document/constants";
import type { Variable } from "../../../types/block";
import { FONT_SIZES, TEXT_ALIGNS, TEXT_COLORS } from "../constants";
import type { EditorTextRange, RichTextInheritedStyle, RichTextMenu } from "../types";
import { useAnchoredToolbar } from "../useAnchoredToolbar";
import { readToolbarState } from "../utils";
import { currentSelection, focusSelection, formatText, isVisuallyBold, toggleVisualBold } from "../formatting";
import { ColorMenu } from "./ColorMenu";
import { EmojiMenu } from "./EmojiMenu";
import { LinkPopover } from "./LinkPopover";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarIcon } from "./ToolbarIcon";
import { ToolbarMenu } from "./ToolbarMenu";
import { ParagraphMetricMenus } from "./ParagraphMetricMenus";
import { preserveTemplateSpaces } from "../template-spaces";
import { VariableMenu } from "./VariableMenu";

interface RichTextToolbarProps {
  id: string;
  editor: Editor;
  variables: Variable[];
  anchorRef: RefObject<HTMLElement | null>;
  inherited: RichTextInheritedStyle;
}

export function RichTextToolbar({
  id,
  editor,
  variables,
  anchorRef,
  inherited,
}: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => (current ? readToolbarState(current) : null),
  });
  const rootRef = useAnchoredToolbar(anchorRef, Boolean(state));
  const linkRange = useRef<EditorTextRange | null>(null);
  const markRange = useRef<EditorTextRange | null>(null);
  const [menu, setMenu] = useState<RichTextMenu | null>(null);
  const [linkUrl, setLinkUrl] = useState("https://");

  useEffect(() => {
    const root = rootRef.current;
    if (!menu || !root) return;
    const ownerDocument = root.ownerDocument;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) setMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    ownerDocument.addEventListener("pointerdown", onPointerDown, true);
    ownerDocument.addEventListener("keydown", onKeyDown);
    return () => {
      ownerDocument.removeEventListener("pointerdown", onPointerDown, true);
      ownerDocument.removeEventListener("keydown", onKeyDown);
    };
  }, [menu, rootRef]);

  if (!state) return null;

  const fontFamily = state.fontFamily || inherited.fontFamily;
  const fontSize = state.fontSize || inherited.fontSize;
  const color = state.color || inherited.color;
  const bold = isVisuallyBold(state.fontWeight, state.bold, inherited.fontWeight);

  const toggleMenu = (next: RichTextMenu) => {
    if (menu !== next) {
      const range = currentSelection(editor);
      if (next === "link") {
        setLinkUrl(state.linkHref || "https://");
        linkRange.current = range;
      }
      if (next === "font" || next === "size" || next === "color" || next === "spacing" || next === "lineHeight") markRange.current = range;
    }
    setMenu((current) => (current === next ? null : next));
  };

  const applyLink = () => {
    const href = linkUrl.trim();
    if (!href) return;
    const range = linkRange.current;
    const chain = focusSelection(editor, range);
    if (range && range.anchor === range.head && !state.linkHref) {
      chain
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).run();
    }
    setMenu(null);
  };

  const unlinkSaved = () => {
    focusSelection(editor, linkRange.current).extendMarkRange("link").unsetLink().run();
    setMenu(null);
  };

  const unlinkSelection = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setMenu(null);
  };

  const run = (command: () => void) => {
    command();
    setMenu(null);
  };

  return (
    <div
      id={id}
      className="ree-rte-toolbar"
      ref={rootRef}
      onMouseDown={(event) => {
        const ownerWindow = event.currentTarget.ownerDocument.defaultView;
        const target = event.target;
        if (
          ownerWindow &&
          target instanceof ownerWindow.Element &&
          target.closest("input, textarea")
        ) return;
        event.preventDefault();
      }}
    >
      <div className="ree-rte-row">
        <ToolbarMenu
          title="Font"
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
                run(() => formatText(editor, (chain) => chain.setFontFamily(font.value), markRange.current))
              }
            >
              {font.label}
            </button>
          ))}
        </ToolbarMenu>
        <ToolbarMenu
          title="Font size"
          open={menu === "size"}
          onToggle={() => toggleMenu("size")}
          label={fontSize || "15px"}
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`ree-rte-option${fontSize === size ? " is-active" : ""}`}
              onClick={() => run(() => formatText(editor, (chain) => chain.setFontSize(size), markRange.current))}
            >
              {size}
            </button>
          ))}
        </ToolbarMenu>
        <span className="ree-rte-sep" />
        <ToolbarButton
          title="Bold"
          active={bold}
          onClick={() => toggleVisualBold(editor, inherited.fontWeight)}
        >
          <span className="ree-tool-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={state.italic}
          onClick={() => formatText(editor, (chain) => chain.toggleItalic())}
        >
          <span className="ree-tool-italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={state.underline}
          onClick={() => formatText(editor, (chain) => chain.toggleUnderline())}
        >
          <span className="ree-tool-underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={state.strike}
          onClick={() => formatText(editor, (chain) => chain.toggleStrike())}
        >
          <span className="ree-tool-strike">S</span>
        </ToolbarButton>
        <span className="ree-rte-sep" />
        <ToolbarMenu
          title="Emoji"
          variant="icon"
          caret={false}
          align="end"
          open={menu === "emoji"}
          onToggle={() => toggleMenu("emoji")}
          label={<ToolbarIcon name="emoji" />}
        >
          <EmojiMenu
            onPick={(emoji) => run(() => editor.chain().focus().insertContent(emoji).run())}
          />
        </ToolbarMenu>
      </div>
      <div className="ree-rte-row">
        {TEXT_ALIGNS.map((align) => (
          <ToolbarButton
            key={align.value}
            title={align.title}
            active={state.align === align.value}
            onClick={() => formatText(editor, (chain) => chain.toggleTextAlign(align.value), null, "paragraph")}
          >
            <ToolbarIcon name={align.icon} />
          </ToolbarButton>
        ))}
        <span className="ree-rte-sep" />
        <ParagraphMetricMenus
          menu={menu}
          spacing={state.spacing}
          lineHeight={state.lineHeight}
          inheritedSpacing={inherited.paragraphSpacing}
          inheritedLineHeight={inherited.lineHeight}
          onToggle={toggleMenu}
          onSpacing={(value) => {
            formatText(editor, (chain) => value
              ? chain.updateAttributes("paragraph", { spacing: value })
              : chain.resetAttributes("paragraph", "spacing"), markRange.current, "paragraph");
          }}
          onLineHeight={(value) => {
            formatText(editor, (chain) => value
              ? chain.updateAttributes("paragraph", { lineHeight: value })
              : chain.resetAttributes("paragraph", "lineHeight"), markRange.current, "paragraph");
          }}
        />
        <span className="ree-rte-sep" />
        <ToolbarButton
          title="Bulleted list"
          active={state.bulletList}
          onClick={() => formatText(editor, (chain) => chain.toggleBulletList(), null, "paragraph")}
        >
          <ToolbarIcon name="list-bullet" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={state.orderedList}
          onClick={() => formatText(editor, (chain) => chain.toggleOrderedList(), null, "paragraph")}
        >
          <ToolbarIcon name="list-ordered" />
        </ToolbarButton>
        <span className="ree-rte-sep" />
        <ToolbarMenu
          title="Text color"
          variant="icon"
          align="end"
          open={menu === "color"}
          onToggle={() => toggleMenu("color")}
          label={
            <span className="ree-tool-color" style={{ borderBottomColor: color }}>
              A
            </span>
          }
        >
          <ColorMenu
            colors={TEXT_COLORS}
            value={state.color}
            fallback={inherited.color}
            onSelect={(color) =>
              run(() => formatText(editor, (chain) => chain.setColor(color), markRange.current))
            }
            onClear={() =>
              run(() => formatText(editor, (chain) => chain.unsetColor(), markRange.current))
            }
          />
        </ToolbarMenu>
        <span className="ree-rte-sep" />
        <ToolbarMenu
          title="Link"
          variant="icon"
          caret={false}
          active={Boolean(state.linkHref)}
          align="end"
          open={menu === "link"}
          onToggle={() => toggleMenu("link")}
          label={<ToolbarIcon name="link" />}
          panelClassName="is-link"
        >
          <LinkPopover
            url={linkUrl}
            canUnlink={Boolean(state.linkHref)}
            onUrlChange={setLinkUrl}
            onApply={applyLink}
            onUnlink={unlinkSaved}
          />
        </ToolbarMenu>
        <ToolbarButton title="Unlink" disabled={!state.linkHref} onClick={unlinkSelection}>
          <ToolbarIcon name="unlink" />
        </ToolbarButton>
        <span className="ree-rte-sep" />
        <ToolbarMenu
          title="Personalization"
          align="end"
          open={menu === "variable"}
          onToggle={() => toggleMenu("variable")}
          label="Personalization"
        >
          <VariableMenu
            variables={variables}
            onInsert={(token) =>
              run(() => editor.chain().focus().insertContent(preserveTemplateSpaces(token)).run())
            }
          />
        </ToolbarMenu>
      </div>
    </div>
  );
}
