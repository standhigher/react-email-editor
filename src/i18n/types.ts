import type { english } from "./locales/en";

export type EditorLocale = "en" | "zh-CN" | "es" | "pt-PT" | "fr";
type LeafKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafKeys<T[K]>}`;
}[keyof T & string];

export type Messages = typeof english;
export type MessageKey = LeafKeys<Messages>;
export type Translate = (key: MessageKey, values?: Record<string, string | number>) => string;

export interface EditorTranslation {
  locale: EditorLocale;
  t: Translate;
}
