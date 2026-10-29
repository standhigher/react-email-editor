import { useMemo } from "react";
import { BlockErrorBoundary } from "../plugins/components/BlockErrorBoundary";
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
  onSelectBlock: (id: string | null) => void;
}

export function Stage({
  session,
  viewMode,
  device,
  onViewModeChange,
  onDeviceChange,
  onSelectBlock,
}: StageProps) {
  const previewKey = useMemo(() => ({ config: session.config, variables: session.variables }), [session.config, session.variables]);
  const { targetId, dropEdge } = useEditorDragState();

  return (
    <div className="ree-col ree-col-center">
      <StageHeader
        viewMode={viewMode}
        device={device}
        onViewModeChange={onViewModeChange}
        onDeviceChange={onDeviceChange}
      />
      {viewMode === "edit" ? (
        <div className="ree-stage-view">
          <Canvas
            blocks={session.document.blocks}
            body={session.document.body}
            definitions={session.definitions}
            selectedId={session.selectedId}
            dropTargetId={targetId}
            dropEdge={dropEdge}
            variables={session.variables}
            templateEngine={session.config.templateEngine}
            device={device}
            onSelect={onSelectBlock}
            onCommitControl={session.updateControl} onCommitControls={session.updateControls}
            onCommitStyle={session.updateStyle}
            onDuplicate={session.duplicateBlock}
            onRemove={session.removeBlock}
          />
        </div>
      ) : (
        <div className="ree-stage-view">
          <BlockErrorBoundary identity={session.document} resetKey={previewKey}>
          <Preview
            document={session.document}
            config={session.config}
            variables={session.variables}
            device={device}
          />
          </BlockErrorBoundary>
        </div>
      )}
    </div>
  );
}
