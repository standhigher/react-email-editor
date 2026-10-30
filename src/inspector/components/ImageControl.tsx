import { useEditorTranslation } from "../../i18n/context";
import { useContext, useEffect, useId, useRef, useState } from "react";
import { EditorConfigContext } from "../../plugins/editor-context";
import { safeEmailUrl } from "../../plugins/email-tools";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import type { ControlRendererProps } from "../ControlRenderer";

type ImageControlError = Error | "inspector.imageUrlHint" | "inspector.imageError";

export function ImageControl({ control, value, onChange }: ControlRendererProps) {
  const t = useEditorTranslation();
  const config = useContext(EditorConfigContext);
  const controller = useRef<AbortController | null>(null);
  const id = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ImageControlError | null>(null);
  const shown = String(value ?? "");
  const url = safeEmailUrl(shown, true);
  useEffect(() => () => controller.current?.abort(), []);
  const choose = async () => {
    if (!config?.pickImage) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true); setError(null);
    try {
      const next = await config.pickImage({ value: shown, label: control.label, signal: request.signal });
      if (!request.signal.aborted && next !== null) {
        if (next && !safeEmailUrl(next, true)) setError("inspector.imageUrlHint");
        else onChange(next);
      }
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause : "inspector.imageError");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  return <div className="ree-field">
    <label className="ree-field-label" htmlFor={id}>{control.label}</label>
    <TextInput id={id} value={shown} disabled={loading} placeholder={control.placeholder ?? "https://example.com/image"} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(shown && !url)} />
    {url && !url.includes("{{") ? <img className="ree-plugin-image" src={url} alt={control.label} /> : <p className="ree-plugin-empty">{shown ? t("inspector.invalidImage") : t("inspector.noImage")}</p>}
    {config?.pickImage ? <Button disabled={loading} onClick={choose}>{loading ? t("inspector.choosing") : error ? t("common.retry") : t("inspector.chooseImage")}</Button> : null}
    {error ? <p className="ree-plugin-error" role="alert">{error instanceof Error ? error.message : t(error)}</p> : null}
  </div>;
}
