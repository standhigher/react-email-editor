# 更新日志

## 0.2.0 — 2026-10-27

### 不兼容变更

- 文档格式由 `version: 1` 升为 `version: 2`，旧版本会被拒绝，不提供自动迁移。请使用 `createEmailDocument()` 创建当前版本文档；升级已有数据时，需同时调整区块字段和样式，不能只修改版本号。
- Heading、Text、Button 的文字格式统一存于 `fields.html`；Button 不再读取 `fields.label` 和 `style.element` 中的文字样式。`EmailElementStyle` 不再继承 `EmailTypographyStyle`。
- 内置区块按各自能力声明 `styleFields`，不再读取未启用的样式；移除内置区块的 `dimension.height` 和区块级 `typography` 配置。自定义区块仍可显式启用这些字段，`exactStyleFields` 同时约束默认样式、画布和邮件输出。
- HTML 区块保留源码内部的段落、列表、链接和显式样式，不再注入正文排版；未声明的属性仍可继承全局样式。

### 新增与改进

- Button 支持画布内富文本编辑，采用单段内容，粘贴多段时以空格连接；邮件输出保留基础行内格式，并只生成一个按钮外层链接。
- 新增 `BlockInspectorSection`、`inspectorSections`、`RichTextProfile` 和 `inlineEditProfile`，支持自定义检查器分组与富文本编辑能力；独立 `RichText` 支持 `profile`。
- 统一颜色面板、HEX 输入和颜色重置；链接编辑改为居中弹窗，支持颜色、下划线和打开方式。
- 优化区块操作栏、拖拽反馈、三栏布局、工具栏换行和预览高度；预览跟随文档内容展示。
- 按钮默认填充改为黑色，按钮和图片的链接默认为空，空白链接不生成跳转；全局内容、区块、按钮和图片边框默认透明。
- 精简中英文 README，补充 npm keywords，发布包包含中文 README 和更新日志。

### 修复与验证

- 修复富文本格式操作后的光标、选区和格式保留，以及列表切换时的间距和缩进保留。
- 修复按钮导出对模板表达式中引号、比较符、注释和空格的处理。
- 接入 Oxlint，补充区块配置、富文本、列表、按钮和颜色转换回归测试。

## 0.1.0 — 2026-10-27

首个正式发布版本（对应提交 `48011d9`）。

- 提供 React 18 编辑器、拖拽区块、富文本编辑、检查器及桌面/移动预览。
- 支持 JSON 文档、全局和区块样式、HTML 源码编辑、自定义区块与 Go template 预览。
- 提供组件 ref 数据读取、独立 HTML 渲染、ESM、TypeScript 类型和独立 CSS 入口。
- 提供 Vite playground、构建和本地 link 联调流程。

## 0.0.0-stage — 2026-10-27

- 发布前的包分发验证版本。
