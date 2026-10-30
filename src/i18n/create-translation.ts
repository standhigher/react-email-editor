import { english } from "./locales/en";
import type { EditorLocale, EditorTranslation, MessageKey, Messages } from "./types";

function readMessage(messages: Messages, key: MessageKey): string | undefined {
  let value: unknown = messages;
  for (const segment of key.split(".")) {
    if (value === null || typeof value !== "object" || !Object.hasOwn(value, segment)) return undefined;
    value = (value as Record<string, unknown>)[segment];
  }
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

// 仅用于编辑器界面文本；不解析 HTML、复数规则或邮件模板。
export function createTranslation(locale: EditorLocale, messages: Messages): EditorTranslation {
  return Object.freeze({
    locale,
    t: (key, values) => {
      const message = readMessage(messages, key) ?? readMessage(english, key) ?? key;
      return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (token: string, name: string) =>
        values && Object.hasOwn(values, name) ? String(values[name]) : token);
    },
  } satisfies EditorTranslation);
}
