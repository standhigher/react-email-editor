import { useId } from "react";

interface BlockActionsProps {
  inlineEdit: boolean;
  toolbarId: string;
  toolbarCollapsed: boolean;
  onToggleToolbar: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function BlockActions({
  inlineEdit,
  toolbarId,
  toolbarCollapsed,
  onToggleToolbar,
  onDuplicate,
  onRemove,
}: BlockActionsProps) {
  const tooltipId = useId();
  const toggleLabel = toolbarCollapsed ? "Expand Toolbar" : "Collapse Toolbar";

  return (
    <div
      className="ree-block-toolbar"
      role="group"
      aria-label="Block actions"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => {
        event.stopPropagation();
        // 点击操作时保留富文本光标和选区，键盘仍可正常聚焦按钮。
        event.preventDefault();
      }}
    >
      <button
        type="button"
        className="ree-block-btn"
        aria-label="Duplicate"
        aria-describedby={`${tooltipId}-duplicate`}
        onClick={onDuplicate}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span id={`${tooltipId}-duplicate`} className="ree-block-tooltip" role="tooltip">Duplicate</span>
      </button>
      <button
        type="button"
        className="ree-block-btn ree-danger"
        aria-label="Delete"
        aria-describedby={`${tooltipId}-delete`}
        onClick={onRemove}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span id={`${tooltipId}-delete`} className="ree-block-tooltip" role="tooltip">Delete</span>
      </button>
      {inlineEdit ? (
        <button
          type="button"
          className="ree-block-btn"
          aria-label={toggleLabel}
          aria-describedby={`${tooltipId}-toolbar`}
          aria-controls={toolbarId}
          aria-expanded={!toolbarCollapsed}
          onClick={onToggleToolbar}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={toolbarCollapsed ? "M8 3H3v5M3 3l7 7M16 21h5v-5m0 5-7-7" : "M3 8h5V3M8 8 2 2m19 14h-5v5m0-5 6 6"} />
          </svg>
          <span id={`${tooltipId}-toolbar`} className="ree-block-tooltip" role="tooltip">{toggleLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
