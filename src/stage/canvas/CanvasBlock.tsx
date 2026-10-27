import { useId, useState, type SyntheticEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { buildRenderContext } from "../../render/context";
import { mergeTemplateData, renderBlockContent } from "../../render/block-html";
import { cssSpacing } from "../../utils/css-values";
import { resolveBlockStyle } from "../../document/block-style";
import { InlineCanvas } from "./components/InlineCanvas";
import { HtmlCanvas } from "./components/HtmlCanvas";
import { BlockActions } from "./components/BlockActions";
import { canvasBlockStyle } from "./block-style";
import type { DropEdge } from "../../editor-dnd/drop-target";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../../types/document";
import type { CanvasDragData } from "../../types/editor";

interface CanvasBlockProps {
  block: EmailBlockNode;
  global: EmailGlobalSettings;
  definition: BlockDefinition | undefined;
  selected: boolean;
  dropEdge: DropEdge | null;
  variables: Variable[];
  onSelect: () => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CanvasBlock({
  block: sourceBlock,
  global,
  definition,
  selected,
  dropEdge,
  variables,
  onSelect,
  onCommitField,
  onDuplicate,
  onRemove,
}: CanvasBlockProps) {
  const block = { ...sourceBlock, style: resolveBlockStyle(sourceBlock.style, definition) };
  const toolbarId = useId();
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const dragData: CanvasDragData = { kind: "canvas" };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, data: dragData });

  const select = (event?: SyntheticEvent) => {
    event?.stopPropagation();
    onSelect();
  };
  const renderedHtml = definition
    ? renderBlockContent(block, [definition], "canvas", {
        resolveHtmlTemplate: block.type === "html",
        templateData: mergeTemplateData(variables, block.defaultData),
        global,
      })
    : "";
  const usesTemplatePreview = block.type === "html";

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
          inlineEdit={Boolean(definition?.inlineEdit)}
          toolbarId={toolbarId}
          toolbarCollapsed={toolbarCollapsed}
          onToggleToolbar={() => setToolbarCollapsed((collapsed) => !collapsed)}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      ) : null}

      <div
        className={`ree-block-content${definition?.inlineEdit ? " is-inline" : ""}`}
        style={canvasBlockStyle(block, global)}
      >
        {definition?.inlineEdit ? (
          <InlineCanvas
            block={block}
            global={global}
            profile={definition.inlineEditProfile}
            variables={variables}
            selected={selected}
            toolbarId={toolbarId}
            toolbarCollapsed={toolbarCollapsed}
            onSelect={onSelect}
            onCommit={(html) => onCommitField(block.id, "html", html)}
          />
        ) : usesTemplatePreview ? (
          <HtmlCanvas
            html={renderedHtml}
            onSelect={select}
          />
        ) : (
          <div
            className="ree-block-static"
            dangerouslySetInnerHTML={{
              __html: definition
                ? definition.render(buildRenderContext(block, "canvas", global, definition))
                : `<!-- ${block.type} -->`,
            }}
          />
        )}
      </div>

      {definition ? <span className="ree-block-badge">{definition.title}</span> : null}
    </div>
  );
}
