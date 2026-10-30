import { hasBuiltinMetadata } from "./builtin-definitions";
import { BLOCK_KEYS, BLOCK_STYLE_KEYS, BLOCK_STYLE_OVERRIDES, CONTROL_KEYS, OPTION_KEYS, SECTION_KEYS } from "./metadata-keys";
import type { BlockDefinition, StyleControlConfig } from "../types/block";
import type { MessageKey, Translate } from "./types";

export function translateMetadata(t: Translate, key: MessageKey | undefined, fallback: string): string {
  return key ? t(key) : fallback;
}

export function localizeStyleControl(control: StyleControlConfig, key: MessageKey | undefined, t: Translate): StyleControlConfig {
  return {
    ...control,
    label: translateMetadata(t, key, control.label),
    options: control.options?.map((option) => ({ ...option, label: translateMetadata(t, OPTION_KEYS[option.value], option.label) })),
  };
}

// 只替换内置声明的展示元数据。覆盖同名内置区块的插件仍归集成者管理。
export function localizeDefinition(definition: BlockDefinition, t: Translate): BlockDefinition {
  if (!hasBuiltinMetadata(definition)) return definition;
  const keys = BLOCK_KEYS[definition.type];
  const htmlBlock = definition.type === "html";
  const styleKeys = { ...BLOCK_STYLE_KEYS, ...BLOCK_STYLE_OVERRIDES[definition.type] };
  return {
    ...definition,
    title: translateMetadata(t, keys?.title, definition.title),
    description: definition.description ? translateMetadata(t, keys?.description, definition.description) : undefined,
    controls: definition.controls?.map((control) => ({
      ...control,
      label: translateMetadata(t, htmlBlock ? "blocks.html.title" : CONTROL_KEYS[control.name], control.label),
      placeholder: control.placeholder && htmlBlock ? t("blocks.html.placeholder") : control.placeholder,
    })),
    styleControls: definition.styleControls?.map((control) => localizeStyleControl(control, styleKeys[control.id], t)),
    inspectorSections: definition.inspectorSections?.map((section) => ({
      ...section, title: translateMetadata(t, SECTION_KEYS[section.id ?? ""], section.title),
    })),
  };
}
