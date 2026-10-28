import { useId, useMemo, useState, type SyntheticEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cssSpacing } from "../../utils/css-values";
import { resolveBlockStyle } from "../../document/block-style";
import { PluginCanvasContent } from "./components/PluginCanvasContent";
import { BlockErrorBoundary } from "../../plugins/components/BlockErrorBoundary";
import { BlockActions } from "./components/BlockActions";
import { canvasBlockStyle } from "./block-style";
import type { DropEdge } from "../../editor-dnd/drop-target";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailBlockNode, EmailBodySettings } from "../../types/document";
import type { CanvasDragData } from "../../types/editor";

interface CanvasBlockProps {
  block: EmailBlockNode;
  body: EmailBodySettings;
  definition: BlockDefinition | undefined;
  selected: boolean;
  dropEdge: DropEdge | null;
  variables: Variable[];
  onSelect: () => void;
  onCommitControl: (id: string, name: string, value: unknown) => void;
  onCommitControls: (id: string, patch: Record<string, unknown>) => void;
  onCommitStyle: (id: string, name: string, value: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CanvasBlock({
  block: sourceBlock,
  body,
  definition,
  selected,
  dropEdge,
  variables,
  onSelect,
  onCommitControl,
  onCommitControls,
  onCommitStyle,
  onDuplicate,
  onRemove,
}: CanvasBlockProps) {
  const block = useMemo(() => ({ ...sourceBlock, style: resolveBlockStyle(sourceBlock.style, definition) }), [sourceBlock, definition]);
  const toolbarId = useId();
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const dragData: CanvasDragData = { kind: "canvas" };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, data: dragData });

  const select = (event?: SyntheticEvent) => {
    event?.stopPropagation();
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
        title="Drag to reorder"
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
          inlineEdit={Boolean(definition?.controls?.some((control) => control.kind === "richText"))}
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
        <BlockErrorBoundary identity={sourceBlock} resetKey={definition}>
          <PluginCanvasContent block={block} body={body} definition={definition} variables={variables} selected={selected} toolbarId={toolbarId} toolbarCollapsed={toolbarCollapsed} select={onSelect} onCommitControl={onCommitControl} onCommitControls={onCommitControls} onCommitStyle={onCommitStyle} />
        </BlockErrorBoundary>
      </div>

      {definition ? <span className="ree-block-badge">{definition.title}</span> : null}
    </div>
  );
}
