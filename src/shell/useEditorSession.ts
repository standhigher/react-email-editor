import { useCallback, useMemo, useRef, useState } from "react";
import { EMPTY_BLOCK_DEFINITIONS, EMPTY_VARIABLES } from "./constants";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import { createBlockNode } from "../document/create-block";
import { createEmptyDocument } from "../document/create-document";
import {
  duplicateBlockNode,
  insertBlockNode,
  moveBlockBy,
  removeBlockNode,
  reorderBlockNodes,
  updateBlockField,
  updateBlockStyle,
  withSubject,
} from "../document/mutations";
import { getBlockDefinition, mergeBlockDefinitions } from "../document/registry";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailDocument } from "../types/document";
import type { EditorSession } from "../types/editor";

interface UseEditorSessionOptions {
  initialDocument?: EmailDocument;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  onChange?: (document: EmailDocument) => void;
}

export function useEditorSession({
  initialDocument,
  blocks = EMPTY_BLOCK_DEFINITIONS,
  variables = EMPTY_VARIABLES,
  onChange,
}: UseEditorSessionOptions): EditorSession {
  const definitions = useMemo(() => mergeBlockDefinitions(blocks), [blocks]);
  const [baseline] = useState<EmailDocument>(() =>
    structuredClone(initialDocument ?? createEmptyDocument()),
  );
  const [document, setDocument] = useState<EmailDocument>(() =>
    structuredClone(baseline),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const documentRef = useRef(document);
  documentRef.current = document;

  const commit = useCallback(
    (next: EmailDocument) => {
      documentRef.current = next;
      setDocument(next);
      onChange?.(next);
    },
    [onChange],
  );

  const getDocument = useCallback(() => structuredClone(documentRef.current), []);

  const selectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const insertBlock = useCallback(
    (type: string, index?: number) => {
      const node = createBlockNode(type, definitions);
      if (!node) return;
      commit(insertBlockNode(documentRef.current, node, index));
      setSelectedId(node.id);
    },
    [commit, definitions],
  );

  const updateField = useCallback(
    (id: string, name: string, value: unknown) => {
      commit(updateBlockField(documentRef.current, id, name, value));
    },
    [commit],
  );

  const updateStyle = useCallback(
    (id: string, styleId: string, value: string) => {
      commit(updateBlockStyle(documentRef.current, id, styleId, value));
    },
    [commit],
  );

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      commit(moveBlockBy(documentRef.current, id, direction));
    },
    [commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      commit(duplicateBlockNode(documentRef.current, id));
    },
    [commit],
  );

  const removeBlock = useCallback(
    (id: string) => {
      commit(removeBlockNode(documentRef.current, id));
      setSelectedId((current) => (current === id ? null : current));
    },
    [commit],
  );

  const reorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      commit(reorderBlockNodes(documentRef.current, activeId, overId));
    },
    [commit],
  );

  const setSubject = useCallback(
    (subject: string) => {
      commit(withSubject(documentRef.current, subject.slice(0, SUBJECT_MAX_LENGTH)));
    },
    [commit],
  );

  const reset = useCallback(() => {
    commit(structuredClone(baseline));
    setSelectedId(null);
  }, [baseline, commit]);

  const selectedBlock =
    document.blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selectedBlock
    ? getBlockDefinition(selectedBlock.type, definitions)
    : undefined;

  return {
    document,
    getDocument,
    definitions,
    variables,
    selectedId,
    selectedBlock,
    selectedDefinition,
    selectBlock,
    insertBlock,
    updateField,
    updateStyle,
    moveBlock,
    duplicateBlock,
    removeBlock,
    reorderBlocks,
    setSubject,
    reset,
  };
}
