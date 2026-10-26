import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CANVAS_DROP_ID,
  EMAIL_COLUMN_PADDING_X,
  contentColumnWidth,
  emailViewportWidth,
} from "../../constants/editor";
import { getBlockDefinition } from "../../document/registry";
import { CanvasBlock } from "./CanvasBlock";
import type { BlockDefinition, Variable } from "../../types/block";
import type { EmailBlockNode, EmailGlobalSettings } from "../../types/document";
import type { EditorDevice } from "../../types/editor";

interface CanvasProps {
  blocks: EmailBlockNode[];
  global: EmailGlobalSettings;
  definitions: BlockDefinition[];
  selectedId: string | null;
  overId: string | null;
  variables: Variable[];
  device: EditorDevice;
  onSelect: (id: string | null) => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Canvas({
  blocks,
  global,
  definitions,
  selectedId,
  overId,
  variables,
  device,
  onSelect,
  onCommitField,
  onMove,
  onDuplicate,
  onRemove,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ID,
    data: { kind: "canvas" },
  });
  return (
    <div
      ref={setNodeRef}
      className={`ree-canvas${isOver ? " is-over" : ""}`}
      onClick={(event) => {
        // Portal 内容可能在另一个 iframe，DOM 类型和焦点必须取自画布所属文档。
        const ownerDocument = event.currentTarget.ownerDocument;
        const ownerWindow = ownerDocument.defaultView;
        const target = event.target;
        if (!ownerWindow || !(target instanceof ownerWindow.Element)) return;
        if (target.closest(".ree-block")) return;
        onSelect(null);
        const active = ownerDocument.activeElement;
        if (active instanceof ownerWindow.HTMLElement && active.closest(".ree-rte")) {
          active.blur();
        }
      }}
    >
      <div
        className="ree-email-surface"
        style={{
          width: emailViewportWidth(device),
          backgroundColor: global.backgroundColor || "#ffffff",
        }}
      >
        <div
          className="ree-canvas-inner"
          style={{
            width: contentColumnWidth(device, global.contentWidth),
            paddingLeft: EMAIL_COLUMN_PADDING_X,
            paddingRight: EMAIL_COLUMN_PADDING_X,
            marginLeft: global.contentAlign === "left" ? 0 : "auto",
            marginRight: global.contentAlign === "right" ? 0 : "auto",
          }}
        >
        {blocks.length === 0 ? (
          <div className="ree-canvas-empty">
            Drag a block here or click one to get started
          </div>
        ) : (
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <CanvasBlock
                key={block.id}
                block={block}
                global={global}
                definition={getBlockDefinition(block.type, definitions)}
                selected={block.id === selectedId}
                isOver={overId === block.id}
                variables={variables}
                onSelect={() => onSelect(block.id)}
                onCommitField={onCommitField}
                onMove={(direction) => onMove(block.id, direction)}
                onDuplicate={() => onDuplicate(block.id)}
                onRemove={() => onRemove(block.id)}
              />
            ))}
          </SortableContext>
        )}
        </div>
      </div>
    </div>
  );
}
