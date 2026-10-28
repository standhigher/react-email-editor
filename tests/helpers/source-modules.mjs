import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import ts from "typescript";

// 内部 React 模块没有公共包入口；复用项目 TypeScript 编译器加载 TSX。
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      for (const extension of [".ts", ".tsx"]) {
        if (existsSync(new URL(`${specifier}${extension}`, context.parentURL))) return nextResolve(`${specifier}${extension}`, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".tsx")) return nextLoad(url, context);
    return {
      format: "module", shortCircuit: true,
      source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
        fileName: url,
      }).outputText,
    };
  },
});
