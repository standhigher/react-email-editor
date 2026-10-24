# @standhigher/react-email-editor

JSON-driven React email template editor. Zero UI framework, CSS-variable themed
(`ree-` prefix). Shell plus three panels: blocks / canvas or preview / inspector.

- Drag & drop: `@dnd-kit`
- Inline rich text: TipTap
- Output: JSON (single source of truth) + HTML (deliverable), read through the
  `EmailEditor` ref
- Render contract: dual-mode `render(ctx)` — `canvas` (static demo) vs `email`
  (Go template directives like `{{range}}` / `{{.customer_name}}`)

## Status

Document is the single source of truth. The shell owns subject, personalization,
and reset. The center column switches between canvas editing and Go-template
preview; desktop and mobile icons only change the canvas width.

## 外部读取数据

编辑器不提供 Save Action。集成方通过 `ref` 主动读取当前数据，自行决定如何保存：

```tsx
import { useRef } from "react";
import { EmailEditor, type EmailEditorHandle } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editorRef = useRef<EmailEditorHandle>(null);

  const readData = () => {
    const data = editorRef.current?.getData();
    // data.document / data.json / data.html，可交给集成方的保存逻辑。
  };

  return (
    <>
      <EmailEditor ref={editorRef} height={720} />
      <button type="button" onClick={readData}>获取数据</button>
    </>
  );
}
```

也可分别调用 `getDocument()`、`getJson()`、`getHtml()`。返回的文档是独立快照，
修改快照不会改变编辑器状态。`onChange` 仍可用于订阅内容变化。

`initialDocument` 仅用于首次初始化；Reset 恢复该初始快照。切换另一份文档时，
请通过 React `key` 创建新的编辑会话。Edit / Preview 切换只改变显示状态，
保留富文本编辑器实例和撤销历史。Heading / Text 默认包含 `16px` padding。

## Development

```bash
pnpm install
pnpm typecheck
```

## 构建与本地 link 联调

构建产物位于 `dist/`，包含 ESM、TypeScript declaration、source map 和
`styles.css`：

```bash
pnpm build
```

开发组件库时可以持续监听并重新生成 `dist/`：

```bash
pnpm build:watch
```

在另一个本地项目中使用构建后的包，可以直接配置 pnpm 的目录链接：

```json
{
  "dependencies": {
    "@standhigher/react-email-editor": "link:../react-email-editor"
  }
}
```

然后执行：

```bash
# 组件库目录
pnpm install
pnpm build:watch

# 消费方项目目录（另一个终端）
pnpm install
pnpm dev
```

也可以使用 pnpm 的全局链接：

```bash
# 组件库目录
pnpm build
pnpm link --global

# 消费方项目目录
pnpm link --global @standhigher/react-email-editor
```

`package.json` 的 `exports` 已指向 `dist`，因此无论使用目录链接还是全局链接，
都需要先执行一次 `pnpm build`；持续开发时使用 `pnpm build:watch`。

链接目标是包含 `package.json` 的组件库根目录，不是 `dist/` 目录本身。
JS、类型声明和 CSS 都通过包入口从 `dist/` 读取。监听命令会处理 `src/` 下的
TypeScript、TSX 和 CSS 改动；它不会启动预览服务，页面仍由消费方的开发服务提供。
已有服务正在运行时直接复用；消费方是否自动刷新取决于其对链接目录的监听配置。

消费方需要安装 React 18 和 React DOM 18。构建产物不会内置 React、React DOM、
TipTap 或 dnd-kit，这些依赖仍由包管理器解析。链接开发时应确保消费方和组件库使用
同一个 React 实例，避免重复 React 导致的 `Invalid hook call`；Vite 可配置
`resolve.dedupe: ["react", "react-dom"]`。
Next.js 项目可保留 `transpilePackages: ["@standhigher/react-email-editor"]`；
使用 Turbopack 且链接目录在项目外时，`turbopack.root` 应覆盖两者的共同父目录。

目前同级 Shopify admin 项目使用 `link:../react-email-editor`。
从原来的源码入口切换到此版本后，也需要先构建，并在开发时保持 `pnpm build:watch` 运行。

## 打包与发布

包目前提供 ESM 入口，不提供 CommonJS `require()` 入口。
发布内容为 `dist/`、README 和许可证，不包含 `src/`。

```bash
# 生成可供其他项目安装验证的压缩包
pnpm pack

# 在消费方安装上一步生成的压缩包（不是持续联调）
pnpm add /absolute/path/to/standhigher-react-email-editor-0.1.0.tgz
```

`prepack` 会在 `pnpm pack` / `pnpm publish` 前自动运行构建，避免发布缺失或过期的
`dist`。发布使用 `pnpm publish`；需要发布到 npm 公共 registry 时使用
`pnpm publish --access public`。以上发布命令仅用于说明，开发和本地联调无需发布。
