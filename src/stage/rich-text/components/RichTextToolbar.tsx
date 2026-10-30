import { useEditorTranslation } from "../../../i18n/context";
import { useEffect, useRef, useState, type RefObject } from "react";
import { isAllowedUri } from "@tiptap/extension-link";
import { DEFAULT_TYPOGRAPHY } from "../../../constants/typography";
import { useEditorState, type Editor } from "@tiptap/react";
import type { RichTextProfile, Variable } from "../../../types/block";
import { DEFAULT_LINK_TARGET, TEXT_ALIGNS } from "../constants";
import type { EditorTextRange, RichTextInheritedStyle, RichTextMenu } from "../types";
import { useAnchoredToolbar } from "../useAnchoredToolbar";
import { readToolbarState } from "../utils";
import { currentSelection, focusSelection, formatText, isVisuallyBold } from "../formatting";
import { EmojiMenu } from "./EmojiMenu";
import { TextColorControl } from "./TextColorControl";
import { TextFormatControls } from "./TextFormatControls";
import { ListControls } from "./ListControls";
import { LinkPopover } from "./LinkPopover";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarIcon } from "./ToolbarIcon";
import { ToolbarMenu } from "./ToolbarMenu";
import { ParagraphMetricMenus } from "./ParagraphMetricMenus";
import { preserveTemplateSpaces } from "../template-spaces";
import { PersonalizationMenu } from "../../../components/PersonalizationMenu";

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
  const t = useEditorTranslation();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => (current ? readToolbarState(current) : null),
  });
  const rootRef = useAnchoredToolbar(anchorRef, Boolean(state), profile === "button");
  const linkRange = useRef<EditorTextRange | null>(null);
  const colorRange = useRef<EditorTextRange | null>(null);
  const variableRange = useRef<EditorTextRange | null>(null);
  const [markRange, setMarkRange] = useState<EditorTextRange | null>(null);
  const [menu, setMenu] = useState<RichTextMenu | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkColor, setLinkColor] = useState("");
  const [linkDecoration, setLinkDecoration] = useState("");
  const [linkTarget, setLinkTarget] = useState(DEFAULT_LINK_TARGET);

  useEffect(() => {
    const root = rootRef.current;
    if (!menu || menu === "link" || !root) return;
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

  const bold = isVisuallyBold(state.fontWeight, state.bold, inherited.fontWeight);

  const toggleMenu = (next: RichTextMenu) => {
    if (menu !== next) {
      const range = currentSelection(editor);
      if (next === "link") {
        setLinkUrl(state.linkHref);
        // 空值保留继承语义，弹窗只负责展示主体默认值。
        setLinkColor(state.linkColor);
        setLinkDecoration(state.linkDecoration);
        setLinkTarget(state.linkTarget === "_self" ? "_self" : DEFAULT_LINK_TARGET);
        linkRange.current = range;
      }
      setMarkRange(range);
    }
    setMenu((current) => (current === next ? null : next));
  };

  const applyLink = () => {
    const href = linkUrl.trim();
    if (!href) {
      if (state.linkHref) unlinkSaved();
      return;
    }
    if (!isAllowedUri(href)) return;
    const attrs = {
      href,
      color: linkColor || null,
      decoration: linkDecoration || null,
      target: linkTarget,
    };
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
      >
        <TextColorControl
          value={state.color}
          fallback={inherited.color}
          onOpen={() => {
            colorRange.current = currentSelection(editor);
            setMenu(null);
          }}
          onChange={(color) =>
            formatText(editor, (chain) => chain.setColor(color), colorRange.current, "text", false)
          }
          onReset={() =>
            formatText(editor, (chain) => chain.unsetColor(), colorRange.current, "text", false)
          }
        />
      </TextFormatControls>
      {profile !== "button" ? (
        <div className="ree-rte-group" role="group" aria-label={t("toolbar.paragraph")}>
          {TEXT_ALIGNS.filter((align) => profile === "text" || align.value !== "justify").map((align) => (
            <ToolbarButton
              key={align.value}
              title={t(align.titleKey)}
              active={state.align === align.value}
              onClick={() => formatText(editor, (chain) => chain.toggleTextAlign(align.value), null, "paragraph")}
            >
              <ToolbarIcon name={align.icon} />
            </ToolbarButton>
          ))}
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
        </div>
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
      {profile !== "button" ? (
        <div className="ree-rte-group" role="group" aria-label={t("toolbar.links")}>
          <ToolbarButton
            title={t("common.link")}
            active={Boolean(state.linkHref)}
            onClick={() => toggleMenu("link")}
          >
            <ToolbarIcon name="link" />
          </ToolbarButton>
          {menu === "link" ? (
            <LinkPopover
              url={linkUrl}
              color={linkColor}
              defaultColor={inherited.linkColor || DEFAULT_TYPOGRAPHY.linkColor}
              decoration={linkDecoration}
              defaultDecoration={inherited.linkDecoration || DEFAULT_TYPOGRAPHY.linkDecoration}
              target={linkTarget}
              onColorChange={setLinkColor}
              onDecorationChange={setLinkDecoration}
              onTargetChange={setLinkTarget}
              canUnlink={Boolean(state.linkHref)}
              onUrlChange={setLinkUrl}
              onApply={applyLink}
              onClose={() => setMenu(null)}
            />
          ) : null}
          <ToolbarButton title={t("toolbar.unlink")} disabled={!state.linkHref} onClick={unlinkSelection}>
            <ToolbarIcon name="unlink" />
          </ToolbarButton>
        </div>
      ) : null}
      <div className="ree-rte-group" role="group" aria-label={t("common.insert")}>
        <ToolbarMenu
          title={t("toolbar.emoji")}
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
        <PersonalizationMenu
          compact
          keyboardScopeRef={anchorRef}
          variables={variables}
          onOpen={() => {
            variableRange.current = currentSelection(editor);
            setMenu(null);
          }}
          onInsert={(token) => run(() => focusSelection(editor, variableRange.current).insertContent(preserveTemplateSpaces(token)).run())}
        />
      </div>
    </div>
  );
}
