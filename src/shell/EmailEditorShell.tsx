"use client";

import { EditorConfigContext, RichTextFocusContext } from "../plugins/editor-context";

import { useState, type KeyboardEvent } from "react";
import { EditorDnd } from "../editor-dnd/EditorDnd";
import { BlockLibrary } from "../block-library/BlockLibrary";
import { Inspector, type InspectorPanel } from "../inspector/Inspector";
import { Stage } from "../stage/Stage";
import { SubjectBar } from "./SubjectBar";
import { useEditorSession } from "./useEditorSession";
import type {
  EditorDevice,
  EditorViewMode,
  EmailEditorProps,
} from "../types/editor";

export function EmailEditorShell({ editor, height = "100%" }: EmailEditorProps) {
  const session = useEditorSession(editor);
  const [activeRichText, setActiveRichText] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<EditorViewMode>("edit");
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [inspectorPanel, setInspectorPanel] = useState<InspectorPanel>("body");

  const [previousReset, setPreviousReset] = useState({ editor, key: session.resetKey });
  if (previousReset.editor !== editor || previousReset.key !== session.resetKey) {
    setPreviousReset({ editor, key: session.resetKey });
    setActiveRichText(null);
    setInspectorPanel("body");
  }

  const [previousSelectedId, setPreviousSelectedId] = useState(session.selectedId);
  if (previousSelectedId !== session.selectedId) {
    setPreviousSelectedId(session.selectedId);
    if (!session.selectedId) setInspectorPanel("body");
  }

  const selectBlock = (id: string | null) => {
    const hadSelection = session.selectedId !== null;
    session.selectBlock(id);
    if (!id) {
      setInspectorPanel("body");
      return;
    }
    if (!hadSelection) setInspectorPanel("block");
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (
      target?.isContentEditable ||
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    ) {
      return;
    }
    selectBlock(null);
  };

  const showCanvas = () => setViewMode("edit");

  return (
    <EditorConfigContext.Provider value={session.config}>
    <RichTextFocusContext.Provider value={{ active: activeRichText, activate: setActiveRichText }}>
    <div key={session.resetKey} className="ree-root" style={{ height }} onKeyDown={handleKeyDown}>
      <SubjectBar
        subject={session.document.subject ?? ""}
        variables={session.variables}
        onSubjectChange={session.setSubject}
      />
      <div className="ree-body">
        <EditorDnd
          blocks={session.document.blocks}
          definitions={session.definitions}
          onInsertBlock={(type, index) => {
            showCanvas();
            if (session.insertBlock(type, index)) setInspectorPanel("block");
          }}
          onReorder={session.reorderBlocks}
          onLibraryDragStart={showCanvas}
        >
          <BlockLibrary
            definitions={session.config.library}
            onAdd={(type) => {
              showCanvas();
              if (session.insertBlock(type)) setInspectorPanel("block");
            }}
          />
          <Stage
            session={session}
            viewMode={viewMode}
            device={device}
            onViewModeChange={setViewMode}
            onDeviceChange={setDevice}
            onSelectBlock={selectBlock}
          />
        </EditorDnd>
        <Inspector
          panel={inspectorPanel}
          body={session.document.body}
          block={session.selectedBlock}
          definition={session.selectedDefinition}
          variables={session.variables}
          onPanelChange={setInspectorPanel}
          onCommitBody={session.updateBody}
          onCommitControl={session.updateControl} onCommitControls={session.updateControls}
          onCommitStyle={session.updateStyle}
        />
      </div>
    </div>
    </RichTextFocusContext.Provider>
    </EditorConfigContext.Provider>
  );
}
