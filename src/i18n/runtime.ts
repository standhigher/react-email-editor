import { LOCALE_ALIASES, LOCALE_LOADERS } from "./constants";
import { createTranslation } from "./create-translation";
import { english } from "./locales/en";
import type { EditorLocale, EditorTranslation } from "./types";

export function normalizeLocale(locale?: string): EditorLocale {
  const normalized = locale?.trim().replaceAll("_", "-").toLowerCase();
  return normalized && Object.hasOwn(LOCALE_ALIASES, normalized) ? LOCALE_ALIASES[normalized] : "en";
}

export const DEFAULT_TRANSLATION = createTranslation("en", english);
const loaded = new Map<EditorLocale, EditorTranslation>([["en", DEFAULT_TRANSLATION]]);
const pending = new Map<EditorLocale, Promise<EditorTranslation>>();

export function getLoadedTranslation(locale: EditorLocale): EditorTranslation | undefined {
  return loaded.get(locale);
}

export function loadTranslation(locale: EditorLocale): Promise<EditorTranslation> {
  const cached = loaded.get(locale);
  if (cached) return Promise.resolve(cached);
  const request = pending.get(locale);
  if (request) return request;
  if (locale === "en") return Promise.resolve(DEFAULT_TRANSLATION);
  const next = LOCALE_LOADERS[locale]().then((messages) => {
    const result = createTranslation(locale, messages);
    loaded.set(locale, result);
    return result;
  }).finally(() => { pending.delete(locale); });
  pending.set(locale, next);
  return next;
}
