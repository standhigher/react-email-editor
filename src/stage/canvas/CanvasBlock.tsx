import { useEditorTranslation } from "../../i18n/context";
import { useContext, useId, useMemo, useState, type SyntheticEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cssSpacing } from "../../utils/css-values";
import { resolveBlockStyle } from "../../document/block-style";
import { PluginCanvasContent } from "./components/PluginCanvasContent";
import { BlockErrorBoundary } from "../../plugins/components/BlockErrorBoundary";
import { BlockActions } from "./components/BlockActions";
import { RichTextFocusContext } from "../../plugins/editor-context";
import { canvasBlockStyle } from "./block-style";
import type { DropEdge } from "../../editor-dnd/drop-target";
import type { BlockDefinition, Variable } from "../../types/block";
import type { TemplateEngine } from "../../types/template";
import type { EmailBlockNode, EmailBodySettings } from "../../types/document";
import type { CanvasDragData } from "../../types/editor";

interface CanvasBlockProps {
  active?: boolean;
  block: EmailBlockNode;
  body: EmailBodySettings;
  definition: BlockDefinition | undefined;
  selected: boolean;
  dropEdge: DropEdge | null;
  variables: Variable[];
  templateEngine: TemplateEngine;
  onSelect: () => void;
  onCommitControl: (id: string, name: string, value: unknown) => void;
  onCommitControls: (id: string, patch: Record<string, unknown>) => void;
  onCommitStyle: (id: string, name: string, value: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CanvasBlock({
  active = true,
  block: sourceBlock,
  body,
  definition,
  selected,
  dropEdge,
  variables,
  templateEngine,
  onSelect,
  onCommitControl,
  onCommitControls,
  onCommitStyle,
  onDuplicate,
  onRemove,
}: CanvasBlockProps) {
  const t = useEditorTranslation();
  const block = useMemo(() => ({ ...sourceBlock, style: resolveBlockStyle(sourceBlock.style, definition) }), [sourceBlock, definition]);
  const renderKey = useMemo(() => ({ definition, templateEngine, variables }), [definition, templateEngine, variables]);
  const toolbarId = useId();
  const richTextFocus = useContext(RichTextFocusContext);
  const hasActiveToolbar = Boolean(definition?.controls?.some((control) =>
    control.kind === "richText" && richTextFocus.active === `${toolbarId}-${control.name}`,
  ));
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const dragData: CanvasDragData = { kind: "canvas" };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, data: dragData, disabled: !active });

  const select = (event?: SyntheticEvent<HTMLElement>) => {
    event?.stopPropagation();
    const target = event?.target;
    const ownerWindow = event?.currentTarget.ownerDocument.defaultView;
    // Portal 菜单属于 React 子树，但不是画布区块的 DOM 内容。
    if (ownerWindow && target instanceof ownerWindow.Node && !event?.currentTarget.contains(target)) return;
    if (ownerWindow && target instanceof ownerWindow.Element && !target.closest(".ree-rte")) {
      richTextFocus.activate(null);
    }
    onSelect();
  };
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        padding: cssSpacing(block.style?.dimension?.margin),
      }}
      className={[
        "ree-block",
        selected ? "is-selected" : "",
        isDragging ? "is-dragging" : "",
        dropEdge === "before" ? "is-drop-before" : "",
        dropEdge === "after" ? "is-drop-after" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={select}
    >
      <span className="ree-block-highlight" aria-hidden="true" />
      <button
        type="button"
        className="ree-block-grip"
        {...attributes}
        {...listeners}
        onClick={select}
        title={t("editor.dragToReorder")}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <circle cx="9" cy="5" r="1.6" />
          <circle cx="15" cy="5" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="19" r="1.6" />
          <circle cx="15" cy="19" r="1.6" />
        </svg>
      </button>

      {selected ? (
        <BlockActions
          hasActiveToolbar={hasActiveToolbar}
          toolbarId={toolbarId}
          toolbarCollapsed={toolbarCollapsed}
          onToggleToolbar={() => setToolbarCollapsed((collapsed) => !collapsed)}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      ) : null}

      <div
        className={`ree-block-content${definition?.inlineControl ? " is-inline" : ""}`}
        style={canvasBlockStyle(block, body)}
      >
        <BlockErrorBoundary identity={sourceBlock} resetKey={renderKey}>
          <PluginCanvasContent block={block} body={body} definition={definition} variables={variables} templateEngine={templateEngine} selected={selected} toolbarId={toolbarId} toolbarCollapsed={toolbarCollapsed} select={onSelect} onCommitControl={onCommitControl} onCommitControls={onCommitControls} onCommitStyle={onCommitStyle} />
        </BlockErrorBoundary>
      </div>

      {definition ? <span className="ree-block-badge">{definition.title}</span> : null}
    </div>
  );
}
