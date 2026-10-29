"use client";

import { useMemo } from "react";
import { buildEmailEditorConfig } from "./config";
import type { EmailEditorConfig, UseEmailEditorConfigOptions } from "./types";

export function useEmailEditorConfig(options: UseEmailEditorConfigOptions = {}): EmailEditorConfig {
  const { plugins, builtins, pickImage, templateEngine } = options;
  return useMemo(() => buildEmailEditorConfig({ plugins, builtins, pickImage, templateEngine }), [plugins, builtins, pickImage, templateEngine]);
}
