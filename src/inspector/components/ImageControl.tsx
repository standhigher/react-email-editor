import { useContext, useEffect, useId, useRef, useState } from "react";
import { EditorConfigContext } from "../../plugins/editor-context";
import { safeEmailUrl } from "../../plugins/email-tools";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import type { ControlRendererProps } from "../ControlRenderer";

export function ImageControl({ control, value, onChange }: ControlRendererProps) {
  const config = useContext(EditorConfigContext);
  const controller = useRef<AbortController | null>(null);
  const id = useId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const shown = String(value ?? "");
  const url = safeEmailUrl(shown, true);
  useEffect(() => () => controller.current?.abort(), []);
  const choose = async () => {
    if (!config?.pickImage) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true); setError("");
    try {
      const next = await config.pickImage({ value: shown, label: control.label, signal: request.signal });
      if (!request.signal.aborted && next !== null) {
        if (next && !safeEmailUrl(next, true)) throw new Error("Use an http, https, cid or template image URL.");
        onChange(next);
      }
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to choose image.");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  };
  return <div className="ree-field">
    <label className="ree-field-label" htmlFor={id}>{control.label}</label>
    <TextInput id={id} value={shown} disabled={loading} placeholder={control.placeholder ?? "https://example.com/image"} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(shown && !url)} />
    {url && !url.includes("{{") ? <img className="ree-plugin-image" src={url} alt={control.label} /> : <p className="ree-plugin-empty">{shown ? "Enter a valid image URL or use a template." : "No image selected."}</p>}
    {config?.pickImage ? <Button disabled={loading} onClick={choose}>{loading ? "Choosing…" : error ? "Retry" : "Choose image"}</Button> : null}
    {error ? <p className="ree-plugin-error" role="alert">{error}</p> : null}
  </div>;
}
