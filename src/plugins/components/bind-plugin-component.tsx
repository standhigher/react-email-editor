import { createElement } from "react";
import type { ComponentType } from "react";
import type { ControlSchema, ControlValues, PluginEditorProps } from "../types";

/** 在插件声明阶段绑定组件，避免画布渲染时重建组件类型。 */
export function bindPluginComponent<Schema extends ControlSchema>(Component?: ComponentType<PluginEditorProps<ControlValues<Schema>>>): ComponentType<PluginEditorProps> | undefined {
  if (!Component) return undefined;
  return function PluginComponent(props: PluginEditorProps) {
    return createElement(Component, {
      ...props,
      controls: props.controls as ControlValues<Schema>,
      setControl: (name, value) => props.setControl(name, value),
    });
  };
}
