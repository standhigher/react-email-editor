import { createEmptyDocument, ensureEmailDocument, mergeEmailBody, sameEmailBody } from "../document/create-document";
import { DEFAULT_EDITOR_CONFIG } from "../plugins/config";
import { snapshotValue } from "../utils/snapshot";
import type { EmailEditorConfig } from "../plugins/types";
import type { Variable } from "../types/block";
import type { EmailDocument } from "../types/document";
import type { EmailEditorInstance, EmailEditorState, UseEmailEditorOptions } from "../types/editor";
import { EMPTY_VARIABLES } from "./constants";
import { generateId } from "../utils/id";

export interface EditorStoreSnapshot {
  document: EmailDocument;
  config: EmailEditorConfig;
  variables: Variable[];
  resetKey: string;
}

export interface EditorStore {
  editor: EmailEditorInstance;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => EditorStoreSnapshot;
  getState: () => EmailEditorState;
  updateOptions: (options: UseEmailEditorOptions) => void;
  flushOptions: () => void;
  commit: (document: EmailDocument, bodyChange?: boolean) => void;
}

const stores = new WeakMap<EmailEditorInstance, EditorStore>();

function copyDocument(document: EmailDocument): EmailDocument {
  return ensureEmailDocument(structuredClone(document));
}

export function getEditorStore(editor: EmailEditorInstance): EditorStore {
  const store = stores.get(editor);
  if (!store) throw new Error("EmailEditor requires an instance returned by useEmailEditor().");
  return store;
}

export function createEditorStore(options: UseEmailEditorOptions): EditorStore {
  let callbacks = options;
  const base = copyDocument(options.initialDocument ?? createEmptyDocument());
  const initial = options.body === undefined ? base : { ...base, body: mergeEmailBody(base.body, options.body) };
  let snapshot: EditorStoreSnapshot = {
    document: initial,
    config: options.config ?? DEFAULT_EDITOR_CONFIG,
    variables: structuredClone(options.variables ?? EMPTY_VARIABLES),
    resetKey: generateId("session"),
  };
  let state: EmailEditorState = snapshotValue({ document: copyDocument(initial) });
  let bodyKey = JSON.stringify(options.body);
  let variablesKey = JSON.stringify(options.variables ?? EMPTY_VARIABLES);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  let optionsChanged = false;
  let pendingBodyDocument: EmailDocument | undefined;
  const setSnapshot = (next: EditorStoreSnapshot) => {
    if (next.document !== snapshot.document) state = snapshotValue({ document: copyDocument(next.document) });
    snapshot = next;
  };
  const flushOptions = () => {
    const shouldNotify = optionsChanged;
    const document = pendingBodyDocument;
    const onChange = callbacks.onChange;
    optionsChanged = false;
    pendingBodyDocument = undefined;
    if (shouldNotify) notify();
    if (document) onChange?.(copyDocument(document));
  };
  const publish = (next: EditorStoreSnapshot) => {
    setSnapshot(next);
    notify();
  };
  const commit = (document: EmailDocument, bodyChange = false) => {
    flushOptions();
    if (document === snapshot.document) return;
    const next = copyDocument(document);
    publish({ ...snapshot, document: next });
    callbacks.onChange?.(copyDocument(next));
    if (bodyChange) callbacks.onBodyChange?.(structuredClone(next.body));
  };
  const replace = (document: EmailDocument) => {
    flushOptions();
    const next = copyDocument(document);
    publish({ ...snapshot, document: next, resetKey: generateId("session") });
    callbacks.onChange?.(copyDocument(next));
  };
  const getDocument = () => copyDocument(snapshot.document);
  const editor: EmailEditorInstance = Object.freeze({
    getDocument,
    getJson: () => JSON.stringify(getDocument(), null, 2),
    getHtml: () => snapshot.config.toHtml(getDocument(), { variables: structuredClone(snapshot.variables) }),
    getRenderedHtml: () => snapshot.config.toHtml(getDocument(), { variables: structuredClone(snapshot.variables), resolveHtmlTemplates: true }),
    getData: () => {
      const document = getDocument();
      const { config } = snapshot;
      const variables = structuredClone(snapshot.variables);
      return {
        document,
        json: JSON.stringify(document, null, 2),
        html: config.toHtml(document, { variables }),
        renderedHtml: config.toHtml(document, { variables, resolveHtmlTemplates: true }),
      };
    },
    setDocument: replace,
    reset: () => replace(initial),
    validate: () => snapshot.config.validate(getDocument()),
  });
  const store: EditorStore = {
    editor,
    subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    getState: () => state,
    commit,
    flushOptions,
    updateOptions: (nextOptions) => {
      callbacks = nextOptions;
      const nextVariablesKey = JSON.stringify(nextOptions.variables ?? EMPTY_VARIABLES);
      const nextBodyKey = JSON.stringify(nextOptions.body);
      let next = snapshot;
      const config = nextOptions.config ?? DEFAULT_EDITOR_CONFIG;
      if (config !== next.config || nextVariablesKey !== variablesKey) {
        next = { ...next, config, variables: structuredClone(nextOptions.variables ?? EMPTY_VARIABLES) };
      }
      variablesKey = nextVariablesKey;
      let bodyChanged = false;
      if (bodyKey !== nextBodyKey && nextOptions.body !== undefined) {
        const body = mergeEmailBody(next.document.body, nextOptions.body);
        bodyChanged = !sameEmailBody(next.document.body, body);
        if (bodyChanged) next = { ...next, document: { ...next.document, body } };
      }
      bodyKey = nextBodyKey;
      if (next !== snapshot) {
        setSnapshot(next);
        optionsChanged = true;
      }
      if (bodyChanged) pendingBodyDocument = next.document;
    },
  };
  stores.set(editor, store);
  return store;
}
