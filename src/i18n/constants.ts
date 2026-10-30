import type { EditorLocale, Messages } from "./types";

export const LOCALE_ALIASES: Readonly<Record<string, EditorLocale>> = {
  en: "en",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  es: "es",
  "pt-pt": "pt-PT",
  fr: "fr",
};

export const LOCALE_LOADERS = {
  "zh-CN": () => import("./locales/zh-CN").then((module) => module.default),
  es: () => import("./locales/es").then((module) => module.default),
  "pt-PT": () => import("./locales/pt-PT").then((module) => module.default),
  fr: () => import("./locales/fr").then((module) => module.default),
} satisfies Record<Exclude<EditorLocale, "en">, () => Promise<Messages>>;
