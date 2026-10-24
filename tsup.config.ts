import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  tsconfig: "tsconfig.build.json",
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  banner: { js: '"use client";' },
  external: [
    "react",
    "react-dom",
    "@dnd-kit/core",
    "@dnd-kit/sortable",
    "@dnd-kit/utilities",
    "@tiptap/extension-link",
    "@tiptap/extension-placeholder",
    "@tiptap/pm",
    "@tiptap/react",
    "@tiptap/starter-kit",
  ],
  onSuccess: "node scripts/copy-style.mjs",
});
