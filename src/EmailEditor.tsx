"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { DEFAULT_BLOCKS } from "./blocks";
import { RichText } from "./RichText";
import {
  buildRenderContext,
  createBlockNode,
  documentToHtml,
  getBlockDefinition,
} from "./render";
import { STYLE_GROUPS } from "./types";
import type {
  BlockDefinition,
  EmailBlockNode,
  EmailBlockStyle,
  EmailDocument,
  FieldConfig,
  StyleFieldConfig,
  Variable,
} from "./types";

// ---------- style 读写工具 ----------

function readStyleValue(
  style: EmailBlockStyle | undefined,
  id: string,
): string {
  const [group, key] = id.split(".");
  if (!group || !key || !style) return "";
  const g = (style as unknown as Record<string, unknown>)[group];
  if (!g || typeof g !== "object") return "";
  const v = (g as Record<string, unknown>)[key];
  return v == null ? "" : String(v);
}

function writeStyleValue(
  style: EmailBlockStyle | undefined,
  id: string,
  value: string,
): EmailBlockStyle {
  const [group, key] = id.split(".");
  const next = structuredClone(style ?? {}) as Record<string, unknown>;
  if (!next[group] || typeof next[group] !== "object") {
    next[group] = {};
  }
  const g = next[group] as Record<string, unknown>;
  if (value === "" || value == null) {
    delete g[key];
  } else {
    g[key] = value;
  }
  return next as unknown as EmailBlockStyle;
}

// ---------- 图标 ----------

function BlockIcon({
  icon,
  className,
}: {
  icon: ReactNode | string | undefined;
  className?: string;
}) {
  if (typeof icon === "string") {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  }
  return <span className={className}>{icon}</span>;
}

// ---------- 区块库条目 ----------

function BlockLibraryItem({
  def,
  onAdd,
}: {
  def: BlockDefinition;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${def.type}`,
    data: { kind: "library", type: def.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`ree-lib-item${isDragging ? " is-dragging" : ""}`}
      onClick={onAdd}
      title={def.description}
    >
      <BlockIcon icon={def.icon} className="ree-lib-icon" />
      <span className="ree-lib-title">{def.title}</span>
    </div>
  );
}

// ---------- 画布内单个区块 ----------

interface BlockWrapperProps {
  block: EmailBlockNode;
  def: BlockDefinition | undefined;
  selected: boolean;
  isOver: boolean;
  variables: Variable[];
  onSelect: () => void;
  onCommitField: (id: string, name: string, value: unknown) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

function BlockWrapper(props: BlockWrapperProps) {
  const {
    block,
    def,
    selected,
    isOver,
    variables,
    onSelect,
    onCommitField,
    onMove,
    onDuplicate,
    onRemove,
  } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, data: { kind: "canvas" } });

  const sortStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cellStyle: React.CSSProperties = {
    padding: block.style?.dimension?.padding ?? "0",
    backgroundColor: block.style?.decorations?.backgroundColor ?? "transparent",
  };

  // 内联富文本区块：把 typography 应用到画布容器，使配置区样式改动在画布实时可见。
  if (def?.inlineEdit) {
    const t = block.style?.typography ?? {};
    cellStyle.fontFamily = "Arial, Helvetica, sans-serif";
    if (t.fontSize) cellStyle.fontSize = t.fontSize;
    if (t.fontWeight) cellStyle.fontWeight = t.fontWeight;
    if (t.lineHeight) cellStyle.lineHeight = t.lineHeight;
    if (t.color) cellStyle.color = t.color;
    if (t.textAlign) cellStyle.textAlign = t.textAlign;
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={sortStyle}
      className={[
        "ree-block",
        selected ? "is-selected" : "",
        isDragging ? "is-dragging" : "",
        isOver ? "is-over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
    >
      {selected ? (
        <div className="ree-block-toolbar" onClick={stop} onMouseDown={stop}>
          <button
            type="button"
            className="ree-block-btn ree-grip"
            {...attributes}
            {...listeners}
            title="拖动排序"
          >
            ⠿
          </button>
          <button
            type="button"
            className="ree-block-btn"
            title="上移"
            onClick={() => onMove(-1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="ree-block-btn"
            title="下移"
            onClick={() => onMove(1)}
          >
            ↓
          </button>
          <button
            type="button"
            className="ree-block-btn"
            title="复制"
            onClick={onDuplicate}
          >
            ⧉
          </button>
          <button
            type="button"
            className="ree-block-btn ree-danger"
            title="删除"
            onClick={onRemove}
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="ree-block-content" style={cellStyle}>
        {def?.inlineEdit ? (
          <RichText
            initialHtml={String(block.fields.html ?? "")}
            variables={variables}
            selected={selected}
            onSelect={onSelect}
            onCommit={(html) => onCommitField(block.id, "html", html)}
          />
        ) : (
          <div
            className="ree-block-static"
            dangerouslySetInnerHTML={{
              __html: def
                ? def.render(buildRenderContext(block, "canvas"))
                : `<!-- ${block.type} -->`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// ---------- 配置区控件 ----------

function VariablesDropdown({
  variables,
  onInsert,
}: {
  variables: Variable[];
  onInsert: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (variables.length === 0) return null;
  return (
    <div className="ree-var-wrap">
      <button
        type="button"
        className="ree-var-btn"
        onClick={() => setOpen((v) => !v)}
        title="插入变量"
      >
        {"{ }"}
      </button>
      {open ? (
        <div className="ree-var-menu">
          {variables.map((v) => (
            <button
              key={v.name}
              type="button"
              className="ree-var-item"
              onClick={() => {
                onInsert(v.name);
                setOpen(false);
              }}
            >
              <span className="ree-var-name">{`{{${v.name}}}`}</span>
              <span className="ree-var-label">{v.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldControl({
  field,
  value,
  variables,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  variables: Variable[];
  onChange: (value: unknown) => void;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const stringValue = value == null ? "" : String(value);

  const insertVariable = (name: string) => {
    const el = ref.current;
    const token = `{{${name}}}`;
    if (el && "selectionStart" in el) {
      const start = el.selectionStart ?? stringValue.length;
      const end = el.selectionEnd ?? stringValue.length;
      const next = stringValue.slice(0, start) + token + stringValue.slice(end);
      onChange(next);
    } else {
      onChange(stringValue + token);
    }
  };

  const common = {
    className: "ree-input",
    value: stringValue,
    placeholder: field.placeholder,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => onChange(e.target.value),
  };

  const label = (
    <div className="ree-field-label">
      <span>{field.label}</span>
      {(field.type === "text" || field.type === "textarea" || field.type === "url") ? (
        <VariablesDropdown variables={variables} onInsert={insertVariable} />
      ) : null}
    </div>
  );

  switch (field.type) {
    case "textarea":
    case "html":
      return (
        <div className="ree-field">
          {label}
          <textarea
            ref={(el) => {
              ref.current = el;
            }}
            {...common}
            rows={field.rows ?? 4}
            className={`ree-input ree-textarea${field.type === "html" ? " ree-code" : ""}`}
          />
        </div>
      );
    case "select":
      return (
        <div className="ree-field">
          <label className="ree-field-label">{field.label}</label>
          <select {...common} className="ree-input">
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "color":
      return (
        <div className="ree-field">
          <label className="ree-field-label">{field.label}</label>
          <div className="ree-color-row">
            <input
              type="color"
              value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(stringValue) ? stringValue : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="ree-color-input"
            />
            <input
              ref={(el) => {
                ref.current = el;
              }}
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
              className="ree-input"
            />
          </div>
        </div>
      );
    default:
      return (
        <div className="ree-field">
          {label}
          <input
            ref={(el) => {
              ref.current = el;
            }}
            {...common}
            type={field.type === "number" ? "number" : "text"}
          />
        </div>
      );
  }
}

function StyleControl({
  cfg,
  value,
  onChange,
}: {
  cfg: StyleFieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ree-field">
      <label className="ree-field-label">{cfg.label}</label>
      {cfg.control === "color" ? (
        <div className="ree-color-row">
          <input
            type="color"
            value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="ree-color-input"
          />
          <input
            className="ree-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : cfg.control === "alignment" ? (
        <div className="ree-align-row">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={`ree-align-btn${value === a ? " is-active" : ""}`}
              onClick={() => onChange(a)}
            >
              {a === "left" ? "⇤" : a === "center" ? "⇔" : "⇥"}
            </button>
          ))}
        </div>
      ) : cfg.control === "select" ? (
        <select
          className="ree-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {(cfg.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="ree-input"
          value={value}
          placeholder="如 16px"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function Inspector({
  block,
  def,
  variables,
  onCommitField,
  onCommitStyle,
}: {
  block: EmailBlockNode | null;
  def: BlockDefinition | undefined;
  variables: Variable[];
  onCommitField: (id: string, name: string, value: unknown) => void;
  onCommitStyle: (id: string, styleId: string, value: string) => void;
}) {
  if (!block || !def) {
    return (
      <div className="ree-inspector-empty">
        点击画布中的区块进行编辑
      </div>
    );
  }

  const contentFields = def.fields ?? [];
  const styleFields = def.styleFields ?? [];
  const grouped = STYLE_GROUPS.map((g) => ({
    group: g,
    fields: styleFields.filter((f) => f.group === g.group),
  })).filter((g) => g.fields.length > 0);

  return (
    <div className="ree-inspector">
      <div className="ree-inspector-head">
        <BlockIcon icon={def.icon} className="ree-inspector-icon" />
        <span className="ree-inspector-title">{def.title}</span>
      </div>

      {contentFields.length > 0 ? (
        <section className="ree-inspector-section">
          <div className="ree-inspector-section-title">内容</div>
          {contentFields.map((f) => (
            <FieldControl
              key={f.name}
              field={f}
              value={block.fields[f.name]}
              variables={variables}
              onChange={(v) => onCommitField(block.id, f.name, v)}
            />
          ))}
        </section>
      ) : null}

      {def.inlineEdit ? (
        <section className="ree-inspector-section">
          <div className="ree-inspector-hint">
            内容在画布中直接点击编辑
          </div>
        </section>
      ) : null}

      {grouped.map(({ group, fields }) => (
        <section key={group.group} className="ree-inspector-section">
          <div className="ree-inspector-section-title">{group.label}</div>
          {fields.map((f) => (
            <StyleControl
              key={f.id}
              cfg={f}
              value={readStyleValue(block.style, f.id)}
              onChange={(v) => onCommitStyle(block.id, f.id, v)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

// ---------- 主组件 ----------

export interface EmailEditorProps {
  initialDocument?: EmailDocument;
  blocks?: BlockDefinition[];
  variables?: Variable[];
  height?: number | string;
  onChange?: (document: EmailDocument) => void;
  onSave?: (payload: { document: EmailDocument; json: string; html: string }) => void;
}

export function EmailEditor({
  initialDocument,
  blocks = [],
  variables = [],
  height = "100%",
  onChange,
  onSave,
}: EmailEditorProps) {
  const defs = useMemo<BlockDefinition[]>(() => {
    const map = new Map<string, BlockDefinition>();
    for (const d of DEFAULT_BLOCKS) map.set(d.type, d);
    for (const d of blocks) map.set(d.type, d);
    return Array.from(map.values());
  }, [blocks]);

  const [doc, setDoc] = useState<EmailDocument>(() =>
    initialDocument ?? { version: 1, blocks: [] },
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    kind: "library" | "canvas";
    type?: string;
  } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [modal, setModal] = useState<"preview" | "html" | "json" | null>(null);

  const docRef = useRef(doc);
  docRef.current = doc;

  const commit = useCallback(
    (updater: (d: EmailDocument) => EmailDocument) => {
      const next = updater(docRef.current);
      docRef.current = next;
      setDoc(next);
      onChange?.(next);
    },
    [onChange],
  );

  const selectBlock = useCallback((id: string | null) => setSelectedId(id), []);

  const addBlock = useCallback(
    (type: string, index?: number) => {
      const node = createBlockNode(type, defs);
      if (!node) return;
      commit((d) => {
        const blocks = [...d.blocks];
        const at = index ?? blocks.length;
        blocks.splice(at, 0, node);
        return { ...d, blocks };
      });
      setSelectedId(node.id);
    },
    [commit, defs],
  );

  const commitField = useCallback(
    (id: string, name: string, value: unknown) => {
      commit((d) => ({
        ...d,
        blocks: d.blocks.map((b) =>
          b.id === id ? { ...b, fields: { ...b.fields, [name]: value } } : b,
        ),
      }));
    },
    [commit],
  );

  const commitStyle = useCallback(
    (id: string, styleId: string, value: string) => {
      commit((d) => ({
        ...d,
        blocks: d.blocks.map((b) =>
          b.id === id
            ? { ...b, style: writeStyleValue(b.style, styleId, value) }
            : b,
        ),
      }));
    },
    [commit],
  );

  const moveBlock = useCallback(
    (id: string, dir: -1 | 1) => {
      commit((d) => {
        const index = d.blocks.findIndex((b) => b.id === id);
        const target = index + dir;
        if (index < 0 || target < 0 || target >= d.blocks.length) return d;
        return { ...d, blocks: arrayMove(d.blocks, index, target) };
      });
    },
    [commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      commit((d) => {
        const index = d.blocks.findIndex((b) => b.id === id);
        if (index < 0) return d;
        const src = d.blocks[index];
        const copy: EmailBlockNode = {
          ...structuredClone(src),
          id: `${src.type}-${crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10)}`,
        };
        const blocks = [...d.blocks];
        blocks.splice(index + 1, 0, copy);
        return { ...d, blocks };
      });
    },
    [commit],
  );

  const removeBlock = useCallback(
    (id: string) => {
      commit((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [commit],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const { setNodeRef: setCanvasRef, isOver: isCanvasOver } = useDroppable({
    id: "canvas",
    data: { kind: "canvas" },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as
      | { kind: "library"; type: string }
      | { kind: "canvas" }
      | undefined;
    setActiveDrag(
      data?.kind === "library" ? { kind: "library", type: data.type } : { kind: "canvas" },
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const active = event.active;
    const over = event.over;
    const activeData = active.data.current as
      | { kind: "library"; type: string }
      | { kind: "canvas" }
      | undefined;

    setActiveDrag(null);
    setOverId(null);

    if (!over) return;

    if (activeData?.kind === "library") {
      // 从区块库拖入：插入到 over 区块之前，或追加到末尾
      const overIdStr = String(over.id);
      const index = overIdStr === "canvas"
        ? docRef.current.blocks.length
        : docRef.current.blocks.findIndex((b) => b.id === overIdStr);
      addBlock(activeData.type, index < 0 ? docRef.current.blocks.length : index);
      return;
    }

    // 画布内排序
    const overIdStr = String(over.id);
    if (active.id === overIdStr) return;
    commit((d) => {
      const oldIndex = d.blocks.findIndex((b) => b.id === active.id);
      const newIndex = d.blocks.findIndex((b) => b.id === overIdStr);
      if (oldIndex < 0 || newIndex < 0) return d;
      return { ...d, blocks: arrayMove(d.blocks, oldIndex, newIndex) };
    });
  };

  const overlayDef =
    activeDrag?.kind === "library"
      ? getBlockDefinition(activeDrag.type ?? "", defs)
      : undefined;

  const selectedBlock = doc.blocks.find((b) => b.id === selectedId) ?? null;
  const selectedDef = selectedBlock
    ? getBlockDefinition(selectedBlock.type, defs)
    : undefined;

  const handleSave = useCallback(() => {
    const html = documentToHtml(docRef.current, defs);
    const json = JSON.stringify(docRef.current, null, 2);
    if (onSave) onSave({ document: docRef.current, json, html });
    else setModal("html");
  }, [defs, onSave]);

  return (
    <div className="ree-root" style={{ height }}>
      <div className="ree-topbar">
        <div className="ree-brand">React Email Editor</div>
        <div className="ree-topbar-actions">
          <button type="button" className="ree-btn" onClick={() => setModal("json")}>
            JSON
          </button>
          <button type="button" className="ree-btn" onClick={() => setModal("html")}>
            HTML
          </button>
          <button type="button" className="ree-btn" onClick={() => setModal("preview")}>
            预览
          </button>
          <button type="button" className="ree-btn ree-btn-primary" onClick={handleSave}>
            生成 HTML
          </button>
        </div>
      </div>

      <div className="ree-body">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <aside className="ree-col ree-col-left">
            <div className="ree-col-head">区块</div>
            <div className="ree-lib">
              {defs.map((def) => (
                <BlockLibraryItem
                  key={def.type}
                  def={def}
                  onAdd={() => addBlock(def.type)}
                />
              ))}
            </div>
          </aside>

          <div className="ree-col ree-col-center">
            <div
              ref={setCanvasRef}
              className={`ree-canvas${isCanvasOver ? " is-over" : ""}`}
            >
              <div className="ree-canvas-inner">
                {doc.blocks.length === 0 ? (
                  <div className="ree-canvas-empty">
                    从左侧拖入或点击区块开始编辑
                  </div>
                ) : (
                  <SortableContext
                    items={doc.blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {doc.blocks.map((block) => (
                      <BlockWrapper
                        key={block.id}
                        block={block}
                        def={getBlockDefinition(block.type, defs)}
                        selected={block.id === selectedId}
                        isOver={overId === block.id}
                        variables={variables}
                        onSelect={() => selectBlock(block.id)}
                        onCommitField={commitField}
                        onMove={(dir) => moveBlock(block.id, dir)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onRemove={() => removeBlock(block.id)}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
          </div>

          <aside className="ree-col ree-col-right">
            <div className="ree-col-head">配置区</div>
            <Inspector
              block={selectedBlock}
              def={selectedDef}
              variables={variables}
              onCommitField={commitField}
              onCommitStyle={commitStyle}
            />
          </aside>

          <DragOverlay>
            {overlayDef ? (
              <div className="ree-drag-overlay">
                <BlockIcon icon={overlayDef.icon} className="ree-lib-icon" />
                <span>{overlayDef.title}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {modal ? (
        <div className="ree-modal-mask" onClick={() => setModal(null)}>
          <div className="ree-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ree-modal-head">
              <span>
                {modal === "preview"
                  ? "预览"
                  : modal === "html"
                    ? "邮件 HTML"
                    : "文档 JSON"}
              </span>
              <button
                type="button"
                className="ree-btn"
                onClick={() => setModal(null)}
              >
                关闭
              </button>
            </div>
            {modal === "preview" ? (
              <iframe
                className="ree-preview-frame"
                title="preview"
                srcDoc={documentToHtml(doc, defs)}
              />
            ) : (
              <pre className="ree-code">
                {modal === "html"
                  ? documentToHtml(doc, defs)
                  : JSON.stringify(doc, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
