"use client";

import { forwardRef, useState, type KeyboardEvent } from "react";
import { EditorDnd } from "../editor-dnd/EditorDnd";
import { BlockLibrary } from "../block-library/BlockLibrary";
import { Inspector, type InspectorPanel } from "../inspector/Inspector";
import { Stage } from "../stage/Stage";
import { EMPTY_VARIABLES } from "./constants";
import { SubjectBar } from "./SubjectBar";
import { useEditorSession } from "./useEditorSession";
import { useEditorHandle } from "./useEditorHandle";
import type {
  EditorDevice,
  EditorViewMode,
  EmailEditorHandle,
  EmailEditorProps,
} from "../types/editor";

export const EmailEditorShell = forwardRef<EmailEditorHandle, EmailEditorProps>(
  function EmailEditorShell({
    initialDocument,
    global,
    blocks,
    variables = EMPTY_VARIABLES,
    height = "100%",
    onChange,
    onGlobalChange,
  }, ref) {
    const session = useEditorSession({
      initialDocument,
      global,
      blocks,
      variables,
      onChange,
      onGlobalChange,
    });
    useEditorHandle(ref, session);
    const [viewMode, setViewMode] = useState<EditorViewMode>("edit");
    const [device, setDevice] = useState<EditorDevice>("desktop");
    const [inspectorPanel, setInspectorPanel] = useState<InspectorPanel>("global");

    const [previousSelectedId, setPreviousSelectedId] = useState(session.selectedId);
    if (previousSelectedId !== session.selectedId) {
      setPreviousSelectedId(session.selectedId);
      if (!session.selectedId) setInspectorPanel("global");
    }

    const selectBlock = (id: string | null) => {
      const hadSelection = session.selectedId !== null;
      session.selectBlock(id);
      if (!id) {
        setInspectorPanel("global");
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
      <div className="ree-root" style={{ height }} onKeyDown={handleKeyDown}>
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
              definitions={session.definitions}
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
            global={session.document.global}
            block={session.selectedBlock}
            definition={session.selectedDefinition}
            variables={session.variables}
            onPanelChange={setInspectorPanel}
            onCommitGlobal={session.updateGlobal}
            onCommitField={session.updateField}
            onCommitStyle={session.updateStyle}
          />
        </div>
      </div>
    );
  },
);
