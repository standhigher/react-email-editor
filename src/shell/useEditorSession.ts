import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_BLOCK_DEFINITIONS, EMPTY_VARIABLES } from "./constants";
import { SUBJECT_MAX_LENGTH } from "../constants/editor";
import { createBlockNode } from "../document/create-block";
import {
  createEmptyDocument,
  ensureEmailDocument,
  mergeEmailGlobal,
  sameEmailGlobal,
  resolveEmailGlobal,
} from "../document/create-document";
import {
  duplicateBlockNode,
  insertBlockNode,
  moveBlockBy,
  removeBlockNode,
  reorderBlockNodes,
  updateBlockField,
  updateBlockStyle,
  updateGlobalSettings,
  withSubject,
} from "../document/mutations";
import { getBlockDefinition, mergeBlockDefinitions } from "../document/registry";
import type { BlockDefinition, Variable } from "../types/block";
import type { EmailDocument, EmailGlobalSettings } from "../types/document";
import type { EditorSession } from "../types/editor";

interface UseEditorSessionOptions {
  initialDocument?: EmailDocument;
  global?: Partial<EmailGlobalSettings>;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  onChange?: (document: EmailDocument) => void;
  onGlobalChange?: (global: EmailGlobalSettings) => void;
}

export function useEditorSession({
  initialDocument,
  global,
  blocks = EMPTY_BLOCK_DEFINITIONS,
  variables = EMPTY_VARIABLES,
  onChange,
  onGlobalChange,
}: UseEditorSessionOptions): EditorSession {
  const definitions = useMemo(() => mergeBlockDefinitions(blocks), [blocks]);
  const [baseline] = useState<EmailDocument>(() => {
    const base = ensureEmailDocument(
      structuredClone(initialDocument ?? createEmptyDocument()),
    );
    if (global === undefined) return base;
    return { ...base, global: mergeEmailGlobal(base.global, global) };
  });
  const [document, setDocument] = useState<EmailDocument>(() =>
    structuredClone(baseline),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const documentRef = useRef(document);
  documentRef.current = document;
  const globalPropRef = useRef(global);
  globalPropRef.current = global;

  const commit = useCallback(
    (next: EmailDocument) => {
      documentRef.current = next;
      setDocument(next);
      onChange?.(next);
    },
    [onChange],
  );

  useEffect(() => {
    if (global === undefined) return;
    const current = documentRef.current;
    const nextGlobal = mergeEmailGlobal(current.global, global);
    if (sameEmailGlobal(resolveEmailGlobal(current.global), nextGlobal)) return;
    commit({ ...current, global: nextGlobal });
  }, [global, commit]);

  const getDocument = useCallback(
    () => ensureEmailDocument(structuredClone(documentRef.current)),
    [],
  );

  const selectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const insertBlock = useCallback(
    (type: string, index?: number) => {
      const node = createBlockNode(type, definitions);
      if (!node) return false;
      commit(insertBlockNode(documentRef.current, node, index));
      setSelectedId(node.id);
      return true;
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

  const updateGlobal = useCallback(
    (patch: Partial<EmailGlobalSettings>) => {
      const next = updateGlobalSettings(documentRef.current, patch);
      commit(next);
      onGlobalChange?.(next.global);
    },
    [commit, onGlobalChange],
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
    const restored = structuredClone(baseline);
    const incoming = globalPropRef.current;
    const next = incoming === undefined
      ? restored
      : { ...restored, global: mergeEmailGlobal(restored.global, incoming) };
    commit(next);
    setSelectedId(null);
  }, [baseline, commit]);

  const resolvedDocument = useMemo(() => ensureEmailDocument(document), [document]);
  const selectedBlock =
    resolvedDocument.blocks.find((block) => block.id === selectedId) ?? null;
  const selectedDefinition = selectedBlock
    ? getBlockDefinition(selectedBlock.type, definitions)
    : undefined;

  return {
    document: resolvedDocument,
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
    updateGlobal,
    moveBlock,
    duplicateBlock,
    removeBlock,
    reorderBlocks,
    setSubject,
    reset,
  };
}
