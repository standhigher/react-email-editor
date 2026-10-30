import { useEditorTranslation } from "../../../i18n/context";
import { useEffect, useId, useRef, useState } from "react";
import { isAllowedUri } from "@tiptap/extension-link";
import { ColorControl } from "../../../components/ColorControl";
import { Button } from "../../../components/Button";
import { CheckboxControl } from "../../../components/CheckboxControl";
import { SelectControl } from "../../../components/SelectControl";
import { TextInput } from "../../../components/TextInput";
import { ResetButton } from "../../../components/ResetButton";
import { LINK_TARGETS } from "../constants";

interface LinkPopoverProps {
  url: string;
  color: string;
  defaultColor: string;
  decoration: string;
  defaultDecoration: string;
  target: string;
  onColorChange: (value: string) => void;
  onDecorationChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  canUnlink: boolean;
  onUrlChange: (url: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export function LinkPopover({
  url,
  color,
  defaultColor,
  decoration,
  defaultDecoration,
  target,
  onColorChange,
  onDecorationChange,
  onTargetChange,
  canUnlink,
  onUrlChange,
  onApply,
  onClose,
}: LinkPopoverProps) {
  const t = useEditorTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const errorId = useId();
  const [submitted, setSubmitted] = useState(false);
  const invalidUrl = Boolean(url.trim()) && !isAllowedUri(url.trim());
  const save = () => {
    setSubmitted(true);
    if ((!url.trim() && !canUnlink) || invalidUrl) return;
    onApply();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector("input")?.select();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="ree-rte-link"
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <h2 id={titleId} className="ree-rte-link-title">{t("toolbar.editLink")}</h2>
      <div className="ree-rte-link-fields">
        <label className="ree-field">
          <span className="ree-field-label">{t("common.linkUrl")}</span>
          <TextInput
            value={url}
            placeholder="https://"
            autoComplete="off"
            aria-invalid={submitted && invalidUrl}
            aria-describedby={submitted && invalidUrl ? errorId : undefined}
            onChange={(event) => onUrlChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              event.stopPropagation();
              save();
            }}
          />
        </label>
        {submitted && invalidUrl ? <p id={errorId} className="ree-rte-link-error" role="alert">{t("toolbar.invalidLink")}</p> : null}
        <ColorControl value={color} fallback={defaultColor} label={t("common.linkColor")} resetTo="" onChange={onColorChange} />
        <div className="ree-field-label">
          <CheckboxControl label={t("common.underline")} checked={(decoration || defaultDecoration) === "underline"} onChange={(checked) => onDecorationChange(checked ? "underline" : "none")} />
          <ResetButton label={t("toolbar.resetLinkUnderline")} disabled={!decoration} onClick={() => onDecorationChange("")} />
        </div>
        <label className="ree-field">
          <span className="ree-field-label">{t("toolbar.target")}</span>
          <SelectControl label={t("toolbar.target")} value={target} options={LINK_TARGETS.map((option) => ({ value: option.value, label: t(option.labelKey) }))} onChange={onTargetChange} />
        </label>
      </div>
      <div className="ree-rte-link-actions">
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="solid" disabled={!url.trim() && !canUnlink} onClick={save}>{t("common.save")}</Button>
      </div>
    </dialog>
  );
}
