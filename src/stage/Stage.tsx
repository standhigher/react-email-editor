import { useEditorTranslation } from "../i18n/context";
import { useMemo, useState } from "react";
import { usePreviewBuffer } from "./preview/usePreviewBuffer";
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
  const t = useEditorTranslation();
  const source = useMemo(() => ({ document: session.document, config: session.config, variables: session.variables, device }), [session.document, session.config, session.variables, device]);
  const requested = viewMode === "preview";
  const preview = usePreviewBuffer(source, requested);
  const [previewVisible, setPreviewVisible] = useState(false);
  if (!requested && previewVisible) setPreviewVisible(false);
  if (requested && !previewVisible && (preview.ready || preview.failure)) setPreviewVisible(true);
  const editing = !requested;
  const { targetId, dropEdge } = useEditorDragState();

  return (
    <div className="ree-col ree-col-center">
      <StageHeader
        viewMode={viewMode}
        device={device}
        onViewModeChange={(mode) => {
          if (mode === "preview") preview.flush();
          onViewModeChange(mode);
        }}
        onDeviceChange={onDeviceChange}
      />
      <div className="ree-stage-content" aria-busy={requested && !preview.ready && !preview.failure}>
        <div className={`ree-stage-view${previewVisible ? " is-buffered" : ""}`} aria-hidden={previewVisible} {...(!editing ? { inert: "" } : {})}>
          <Canvas
            blocks={session.document.blocks}
            body={session.document.body}
            definitions={session.definitions}
            active={editing}
            selectedId={editing ? session.selectedId : null}
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
        <div className={`ree-stage-view${previewVisible ? "" : " is-buffered"}`} aria-hidden={!previewVisible} {...(!previewVisible ? { inert: "" } : {})}>
          <Preview frames={preview.frames} front={preview.front} failure={preview.displayFailure} onReady={preview.markReady} onFailed={preview.markFailed} onRetry={preview.retry} />
        </div>
        {requested && !preview.ready && !preview.failure ? <div className="ree-preview-pending" role="status">{t("preview.preparing")}</div> : null}
      </div>
    </div>
  );
}
