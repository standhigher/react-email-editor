import { Canvas } from "./canvas/Canvas";
import { Preview } from "./preview/Preview";
import { StageHeader } from "./StageHeader";
import { useEditorDragState } from "../editor-dnd/drag-context";
import type { EditorSession, EditorDevice, EditorViewMode } from "../types/editor";

interface StageProps {
  session: EditorSession;
  viewMode: EditorViewMode;
  device: EditorDevice;
  onViewModeChange: (mode: EditorViewMode) => void;
  onDeviceChange: (device: EditorDevice) => void;
}

export function Stage({
  session,
  viewMode,
  device,
  onViewModeChange,
  onDeviceChange,
}: StageProps) {
  const { overId } = useEditorDragState();

  return (
    <div className="ree-col ree-col-center">
      <StageHeader
        viewMode={viewMode}
        device={device}
        onViewModeChange={onViewModeChange}
        onDeviceChange={onDeviceChange}
      />
      <div className="ree-stage-view" hidden={viewMode !== "edit"}>
        <Canvas
          blocks={session.document.blocks}
          definitions={session.definitions}
          selectedId={session.selectedId}
          overId={overId}
          variables={session.variables}
          device={device}
          onSelect={session.selectBlock}
          onCommitField={session.updateField}
          onMove={session.moveBlock}
          onDuplicate={session.duplicateBlock}
          onRemove={session.removeBlock}
        />
      </div>
      <div className="ree-stage-view" hidden={viewMode !== "preview"}>
        <Preview
          document={session.document}
          definitions={session.definitions}
          variables={session.variables}
          device={device}
        />
      </div>
    </div>
  );
}
