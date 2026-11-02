import { hasBuiltinMetadata } from "./builtin-definitions";
import { localizeStyleControlLabels } from "./style-control-metadata";
import { BLOCK_KEYS, CONTROL_KEYS, OPTION_KEYS, SECTION_KEYS } from "./metadata-keys";
import type { BlockDefinition, StyleControlConfig } from "../types/block";
import type { MessageKey, Translate } from "./types";

export function translateMetadata(t: Translate, key: MessageKey | undefined, fallback: string): string {
  return key ? t(key) : fallback;
}

export function localizeStyleControl(control: StyleControlConfig, key: MessageKey | undefined, t: Translate): StyleControlConfig {
  return localizeStyleControlLabels({
    ...control,
    labelKey: key,
    options: control.options?.map((option) => ({ ...option, labelKey: OPTION_KEYS[option.value] })),
  }, t);
}

// 自定义声明只翻译库自动注入的公共样式；显式替换的控件归集成者管理。
export function localizeDefinition(definition: BlockDefinition, t: Translate): BlockDefinition {
  const styleControls = definition.styleControls?.map((control) => localizeStyleControlLabels(control, t));
  if (!hasBuiltinMetadata(definition)) {
    return styleControls?.some((control, index) => control !== definition.styleControls?.[index])
      ? { ...definition, styleControls }
      : definition;
  }
  const keys = BLOCK_KEYS[definition.type];
  const htmlBlock = definition.type === "html";
  return {
    ...definition,
    title: translateMetadata(t, keys?.title, definition.title),
    description: definition.description ? translateMetadata(t, keys?.description, definition.description) : undefined,
    controls: definition.controls?.map((control) => ({
      ...control,
      label: translateMetadata(t, htmlBlock ? "blocks.html.title" : CONTROL_KEYS[control.name], control.label),
      placeholder: control.placeholder && htmlBlock ? t("blocks.html.placeholder") : control.placeholder,
    })),
    styleControls,
    inspectorSections: definition.inspectorSections?.map((section) => ({
      ...section, title: translateMetadata(t, SECTION_KEYS[section.id ?? ""], section.title),
    })),
  };
}
