import { useContext, useId } from "react";
import { PluginEditorContext } from "../../plugins/editor-context";
import { EditableRichText } from "../../plugins/components/EditableRichText";
import { resolveEmailBody } from "../../document/create-document";
import { typographyStyle } from "../../utils/style";
import { contentVariables } from "../../render/content-style";
import type { ControlRendererProps } from "../ControlRenderer";

export function RichTextControl({ control, value, variables, body, onChange }: ControlRendererProps) {
  const parent = useContext(PluginEditorContext);
  const id = useId();
  const context = {
    block: parent?.block ?? { id, type: "control", controls: {} },
    controls: { [control.name]: value }, style: parent?.style ?? {}, body: body ?? resolveEmailBody(),
    variables, selected: true, renderedHtml: "", select: () => {},
    setControl: (_name: string, next: unknown) => onChange(next),
    setControls: (patch: Record<string, unknown>) => { if (Object.hasOwn(patch, control.name)) onChange(patch[control.name]); },
    setStyle: () => {},
    toolbarId: id, toolbarCollapsed: false, controlDefinitions: [control], profiles: { [control.name]: control.profile },
  };
  return <div className="ree-field"><span className="ree-field-label">{control.label}</span><div className="ree-plugin-richtext" style={{ ...typographyStyle(context.style, context.body), ...contentVariables(context.style, context.body) }}><PluginEditorContext.Provider value={context}><EditableRichText control={control.name} placeholder={control.placeholder} /></PluginEditorContext.Provider></div></div>;
}
