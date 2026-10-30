"use client";

import { useMemo } from "react";
import { buildEmailEditorConfig } from "./config";
import type { EmailEditorConfig, UseEmailEditorConfigOptions } from "./types";

export function useEmailEditorConfig(options: UseEmailEditorConfigOptions = {}): EmailEditorConfig {
  const { locale, plugins, builtins, pickImage, templateEngine } = options;
  return useMemo(() => buildEmailEditorConfig({ locale, plugins, builtins, pickImage, templateEngine }), [locale, plugins, builtins, pickImage, templateEngine]);
}
