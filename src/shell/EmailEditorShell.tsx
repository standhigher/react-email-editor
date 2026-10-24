"use client";

import { forwardRef, useState, type KeyboardEvent } from "react";
import { EditorDnd } from "../editor-dnd/EditorDnd";
import { BlockLibrary } from "../block-library/BlockLibrary";
import { Inspector } from "../inspector/Inspector";
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
    blocks,
    variables = EMPTY_VARIABLES,
    height = "100%",
    onChange,
  }, ref) {
    const session = useEditorSession({
      initialDocument,
      blocks,
      variables,
      onChange,
    });
    useEditorHandle(ref, session);
    const [viewMode, setViewMode] = useState<EditorViewMode>("edit");
    const [device, setDevice] = useState<EditorDevice>("desktop");

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
      session.selectBlock(null);
    };

    const showCanvas = () => setViewMode("edit");

    return (
      <div className="ree-root" style={{ height }} onKeyDown={handleKeyDown}>
        <SubjectBar
          subject={session.document.subject ?? ""}
          variables={session.variables}
          onSubjectChange={session.setSubject}
          onReset={session.reset}
        />
        <div className="ree-body">
          <EditorDnd
            blocks={session.document.blocks}
            definitions={session.definitions}
            onInsertBlock={(type, index) => {
              showCanvas();
              session.insertBlock(type, index);
            }}
            onReorder={session.reorderBlocks}
            onLibraryDragStart={showCanvas}
          >
            <BlockLibrary
              definitions={session.definitions}
              onAdd={(type) => {
                showCanvas();
                session.insertBlock(type);
              }}
            />
            <Stage
              session={session}
              viewMode={viewMode}
              device={device}
              onViewModeChange={setViewMode}
              onDeviceChange={setDevice}
            />
          </EditorDnd>
          <Inspector
            block={session.selectedBlock}
            definition={session.selectedDefinition}
            variables={session.variables}
            onCommitField={session.updateField}
            onCommitStyle={session.updateStyle}
          />
        </div>
      </div>
    );
  },
);
