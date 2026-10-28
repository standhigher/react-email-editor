import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("发布包包含所有入口、类型和文档，排除开发文件与 PNG 原图", () => {
  const [packed] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.toLowerCase().startsWith("npm_config_"))),
      npm_config_update_notifier: "false",
    },
  }));
  const files = new Set(packed.files.map((file) => file.path));
  for (const path of [
    manifest.main, manifest.module, manifest.types,
    manifest.exports["."].types, manifest.exports["."].import,
    manifest.exports["./styles.css"],
    "package.json", "LICENSE", "README.md", "README.zh-CN.md",
    "docs/changelog.md", "docs/changelog.zh-CN.md",
    "docs/release.md", "docs/release.zh-CN.md",
    "docs/assets/architecture.svg", "docs/assets/architecture.zh-CN.svg",
  ]) assert.ok(files.has(path.replace(/^\.\//, "")), path);
  for (const path of files) {
    assert.match(path, /^(?:dist\/(?:index\.js|index\.d\.ts|styles\.css)|docs\/.+\.(?:md|svg)|package\.json|LICENSE|README(?:\.zh-CN)?\.md)$/);
  }
  assert.equal(packed.bundled.length, 0);
});

test("中英文 README 图片与查看链接使用已发布资源的固定绝对地址", () => {
  for (const [file, suffix] of [["README.md", ""], ["README.zh-CN.md", ".zh-CN"]]) {
    const markdown = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const images = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
    const base = "https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture";
    assert.deepEqual(images, [`${base}${suffix}.png`]);
    assert.ok(markdown.includes(`(${base}${suffix}.svg)`));
  }
});

test("README 文档导航使用 GitHub 绝对地址且目标文件与章节存在", () => {
  const base = "https://github.com/standhigher/react-email-editor/blob/main/";
  for (const file of ["README.md", "README.zh-CN.md"]) {
    const markdown = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const [, target] of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const url = new URL(target);
      if (url.href === "http://localhost:5173/") continue;
      assert.equal(url.protocol, "https:", target);
      if (url.hostname === "cdn.jsdelivr.net") continue;
      assert.ok(target.startsWith(base), target);
      const document = readFileSync(new URL(`../${url.pathname.split("/blob/main/")[1]}`, import.meta.url), "utf8");
      if (!url.hash) continue;
      const headings = [...document.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, title]) =>
        title.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s/g, "-"));
      assert.ok(headings.includes(decodeURIComponent(url.hash.slice(1))), target);
    }
  }
});

test("消费方可移除未使用的包导入，同时保留显式导入的编辑器 CSS", async () => {
  const result = await build({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [{
      name: "package-consumer",
      resolveId(id) {
        if (id === "virtual:package-consumer") return "\0package-consumer";
      },
      load(id) {
        if (id === "\0package-consumer") return `
          import "@standhigher/react-email-editor";
          import "@standhigher/react-email-editor/styles.css";
          console.log("consumer-with-styles");
        `;
      },
    }],
    build: {
      write: false,
      minify: false,
      rolldownOptions: { input: "virtual:package-consumer" },
    },
  });
  const javascript = result.output.filter((file) => file.type === "chunk").map((file) => file.code).join("\n");
  const css = result.output.filter((file) => file.type === "asset" && file.fileName.endsWith(".css")).map((file) => String(file.source)).join("\n");
  assert.match(javascript, /consumer-with-styles/);
  assert.ok(javascript.length < 1000, "未使用的编辑器及依赖应被移除");
  assert.match(css, /\.ree-root\s*\{/);
  assert.match(css, /\.ree-btn\s*\{/);
});
