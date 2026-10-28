import { ControlRenderer } from "../../inspector/ControlRenderer";
import { usePluginEditor } from "../editor-context";

/** Declared-control component props within plugin context. */
export interface ControlEditorProps {
  /** Declared control name; unknown names throw. */
  control: string;
}

/** Reuse declared controls, image pickers and validation inside a plugin inspector. */
export function ControlEditor({ control }: ControlEditorProps) {
  const context = usePluginEditor();
  const definition = context.controlDefinitions.find((item) => item.name === control);
  if (!definition) throw new Error(`Unknown plugin control: ${control}`);
  return <ControlRenderer control={definition} value={context.controls[control]} body={context.body} variables={context.variables} onChange={(value) => context.setControl(control, value)} />;
}
