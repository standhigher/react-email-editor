import type { MouseEvent, SyntheticEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { buildRenderContext } from "../../render/context";
import { RichText } from "../rich-text/RichText";
import { canvasBlockStyle } from "./block-style";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailBlockNode } from "../../types/document";
import type { CanvasDragData } from "../../types/editor";

interface CanvasBlockProps {
  block: EmailBlockNode;
  definition: BlockDefinition | undefined;
  selected: boolean;
  isOver: boolean;
  variables: Variable[];
  onSelect: () => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CanvasBlock({
  block,
  definition,
  selected,
  isOver,
  variables,
  onSelect,
  onCommitField,
  onMove,
  onDuplicate,
  onRemove,
}: CanvasBlockProps) {
  const dragData: CanvasDragData = { kind: "canvas" };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, data: dragData });

  const stop = (event: SyntheticEvent) => event.stopPropagation();
  const select = (event: MouseEvent) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={[
        "ree-block",
        selected ? "is-selected" : "",
        isDragging ? "is-dragging" : "",
        isOver ? "is-over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={select}
    >
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
        <div
          className="ree-block-toolbar"
          onClick={stop}
          onPointerDown={stop}
          onMouseDown={stop}
        >
          <button
            type="button"
            className="ree-block-btn"
            title="Move up"
            onClick={() => onMove(-1)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="ree-block-btn"
            title="Move down"
            onClick={() => onMove(1)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="ree-block-btn"
            title="Duplicate"
            onClick={onDuplicate}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            type="button"
            className="ree-block-btn ree-danger"
            title="Delete"
            onClick={onRemove}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      ) : null}

      <div className="ree-block-content" style={canvasBlockStyle(block, definition?.inlineEdit)}>
        {definition?.inlineEdit ? (
          <RichText
            initialHtml={String(block.fields.html ?? "")}
            variables={variables}
            selected={selected}
            onSelect={onSelect}
            onCommit={(html) => onCommitField(block.id, "html", html)}
          />
        ) : (
          <div
            className="ree-block-static"
            dangerouslySetInnerHTML={{
              __html: definition
                ? definition.render(buildRenderContext(block, "canvas"))
                : `<!-- ${block.type} -->`,
            }}
          />
        )}
      </div>

      {definition ? <span className="ree-block-badge">{definition.title}</span> : null}
    </div>
  );
}
