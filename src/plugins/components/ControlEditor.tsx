import { ControlRenderer } from "../../inspector/ControlRenderer";
import { usePluginEditor } from "../editor-context";

export interface ControlEditorProps {
  control: string;
}

/** 自定义 Inspector 复用字段声明、资源选择器、校验和标准控件。 */
export function ControlEditor({ control }: ControlEditorProps) {
  const context = usePluginEditor();
  const definition = context.controlDefinitions.find((item) => item.name === control);
  if (!definition) throw new Error(`Unknown plugin control: ${control}`);
  return <ControlRenderer control={definition} value={context.controls[control]} body={context.body} variables={context.variables} onChange={(value) => context.setControl(control, value)} />;
}
