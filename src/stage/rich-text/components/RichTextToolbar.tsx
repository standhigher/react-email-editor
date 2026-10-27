import { useEffect, useRef, useState, type RefObject } from "react";
import { isAllowedUri } from "@tiptap/extension-link";
import { useEditorState, type Editor } from "@tiptap/react";
import type { RichTextProfile, Variable } from "../../../types/block";
import { TEXT_ALIGNS, TEXT_COLORS } from "../constants";
import type { EditorTextRange, RichTextInheritedStyle, RichTextMenu } from "../types";
import { useAnchoredToolbar } from "../useAnchoredToolbar";
import { readToolbarState } from "../utils";
import { currentSelection, focusSelection, formatText, isVisuallyBold } from "../formatting";
import { ColorMenu } from "./ColorMenu";
import { TextFormatControls } from "./TextFormatControls";
import { ListControls } from "./ListControls";
import { LinkPopover } from "./LinkPopover";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarIcon } from "./ToolbarIcon";
import { ToolbarMenu } from "./ToolbarMenu";
import { ParagraphMetricMenus } from "./ParagraphMetricMenus";
import { preserveTemplateSpaces } from "../template-spaces";
import { VariableMenu } from "./VariableMenu";

interface RichTextToolbarProps {
  id: string;
  profile: RichTextProfile;
  editor: Editor;
  variables: Variable[];
  anchorRef: RefObject<HTMLElement | null>;
  inherited: RichTextInheritedStyle;
}

export function RichTextToolbar({
  id,
  profile,
  editor,
  variables,
  anchorRef,
  inherited,
}: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => (current ? readToolbarState(current) : null),
  });
  const rootRef = useAnchoredToolbar(anchorRef, Boolean(state), profile === "button");
  const linkRange = useRef<EditorTextRange | null>(null);
  const [markRange, setMarkRange] = useState<EditorTextRange | null>(null);
  const [menu, setMenu] = useState<RichTextMenu | null>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkColor, setLinkColor] = useState("");
  const [linkDecoration, setLinkDecoration] = useState("");

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

  const color = state.color || inherited.color;
  const bold = isVisuallyBold(state.fontWeight, state.bold, inherited.fontWeight);

  const toggleMenu = (next: RichTextMenu) => {
    if (menu !== next) {
      const range = currentSelection(editor);
      if (next === "link") {
        setLinkUrl(state.linkHref || "https://");
        setLinkColor(state.linkColor);
        setLinkDecoration(state.linkDecoration);
        linkRange.current = range;
      }
      setMarkRange(range);
    }
    setMenu((current) => (current === next ? null : next));
  };

  const applyLink = () => {
    const href = linkUrl.trim();
    if (!href || !isAllowedUri(href)) return;
    const attrs = { href, color: linkColor || null, decoration: linkDecoration || null };
    const range = linkRange.current;
    const chain = focusSelection(editor, range);
    if (range && range.anchor === range.head && !state.linkHref) {
      chain
        .insertContent({
          type: "text",
          text: href,
          marks: [{ type: "link", attrs }],
        })
        .run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).updateAttributes("link", attrs).run();
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
          target.closest("input, textarea, select")
        ) return;
        event.preventDefault();
      }}
    >
      <div className="ree-rte-row">
        <TextFormatControls
          editor={editor}
          profile={profile}
          state={state}
          inherited={inherited}
          menu={menu}
          range={markRange}
          bold={bold}
          toggleMenu={toggleMenu}
          run={run}
        />
      </div>
      <div className="ree-rte-row">
        {profile !== "button" ? (
          <>
            {TEXT_ALIGNS.filter((align) => profile === "text" || align.value !== "justify").map((align) => (
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
              showSpacing={profile === "text"}
              spacing={state.spacing}
              lineHeight={state.lineHeight}
              inheritedSpacing={inherited.paragraphSpacing}
              inheritedLineHeight={inherited.lineHeight}
              onToggle={toggleMenu}
              onSpacing={(value) => {
                formatText(editor, (chain) => value
                  ? chain.updateAttributes("paragraph", { spacing: value })
                  : chain.resetAttributes("paragraph", "spacing"), markRange, "paragraph");
              }}
              onLineHeight={(value) => {
                formatText(editor, (chain) => value
                  ? chain.updateAttributes("paragraph", { lineHeight: value })
                  : chain.resetAttributes("paragraph", "lineHeight"), markRange, "paragraph");
              }}
            />
          </>
        ) : null}
        {profile === "text" ? (
          <ListControls
            editor={editor}
            state={state}
            menu={menu}
            range={markRange}
            inherited={inherited}
            onToggle={toggleMenu}
          />
        ) : null}
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
              run(() => formatText(editor, (chain) => chain.setColor(color), markRange))
            }
            onClear={() =>
              run(() => formatText(editor, (chain) => chain.unsetColor(), markRange))
            }
          />
        </ToolbarMenu>
        {profile !== "button" ? (
          <>
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
                color={linkColor}
                fallbackColor={inherited.linkColor || inherited.color}
                decoration={linkDecoration}
                onColorChange={setLinkColor}
                onDecorationChange={setLinkDecoration}
                canUnlink={Boolean(state.linkHref)}
                onUrlChange={setLinkUrl}
                onApply={applyLink}
                onUnlink={unlinkSaved}
              />
            </ToolbarMenu>
            <ToolbarButton title="Unlink" disabled={!state.linkHref} onClick={unlinkSelection}>
              <ToolbarIcon name="unlink" />
            </ToolbarButton>
          </>
        ) : null}
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
