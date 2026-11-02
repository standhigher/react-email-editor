import type { english } from "./locales/en";
import type { ControlOption, StyleControlConfig } from "../types/block";

export type EditorLocale = "en" | "zh-CN" | "es" | "pt-PT" | "fr";
type LeafKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafKeys<T[K]>}`;
}[keyof T & string];

export type Messages = typeof english;
export type MessageKey = LeafKeys<Messages>;
export type Translate = (key: MessageKey, values?: Record<string, string | number>) => string;

/** 仅在库内部声明和 UI 定义之间流动，不属于公共控件 API。 */
export interface TranslatableControlOption extends ControlOption {
  labelKey?: MessageKey;
}

export interface TranslatableStyleControl extends StyleControlConfig {
  labelKey?: MessageKey;
  options?: TranslatableControlOption[];
}

export interface EditorTranslation {
  locale: EditorLocale;
  t: Translate;
}
