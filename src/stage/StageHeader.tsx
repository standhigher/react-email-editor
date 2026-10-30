import { useEditorTranslation } from "../i18n/context";
import type { EditorDevice, EditorViewMode } from "../types/editor";

interface StageHeaderProps {
  viewMode: EditorViewMode;
  device: EditorDevice;
  onViewModeChange: (mode: EditorViewMode) => void;
  onDeviceChange: (device: EditorDevice) => void;
}

export function StageHeader({
  viewMode,
  device,
  onViewModeChange,
  onDeviceChange,
}: StageHeaderProps) {
  const t = useEditorTranslation();
  return (
    <div className="ree-col-head ree-stage-head">
      <div className="ree-segment" role="group" aria-label={t("editor.editorMode")}>
        <button
          type="button"
          className={`ree-segment-btn${viewMode === "edit" ? " is-active" : ""}`}
          aria-pressed={viewMode === "edit"}
          aria-label={t("common.edit")}
          title={t("common.edit")}
          onClick={() => onViewModeChange("edit")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
          </svg>
        </button>
        <span className="ree-segment-divider" aria-hidden="true" />
        <button
          type="button"
          className={`ree-segment-btn ree-segment-btn-label${viewMode === "preview" ? " is-active" : ""}`}
          aria-pressed={viewMode === "preview"}
          aria-label={t("common.preview")}
          title={t("common.preview")}
          onClick={() => onViewModeChange("preview")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        </button>
      </div>
      <div className="ree-segment" role="group" aria-label={t("editor.canvasDevice")}>
        <button
          type="button"
          className={`ree-segment-btn${device === "desktop" ? " is-active" : ""}`}
          aria-pressed={device === "desktop"}
          aria-label={t("common.desktop")}
          title={t("common.desktop")}
          onClick={() => onDeviceChange("desktop")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="12" rx="1.5" />
            <path d="M8 20h8" />
            <path d="M12 16v4" />
          </svg>
        </button>
        <span className="ree-segment-divider" aria-hidden="true" />
        <button
          type="button"
          className={`ree-segment-btn${device === "mobile" ? " is-active" : ""}`}
          aria-pressed={device === "mobile"}
          aria-label={t("common.mobile")}
          title={t("common.mobile")}
          onClick={() => onDeviceChange("mobile")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="7" y="2.5" width="10" height="19" rx="2" />
            <path d="M11 18.5h2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
