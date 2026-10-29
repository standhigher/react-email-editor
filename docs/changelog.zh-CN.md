# 更新日志

[English](./changelog.md) | 简体中文

## 未发布 — 2026-10-29

### 模板预览与自定义引擎

- 新增同步 `TemplateEngine` 适配器，通过 `useEmailEditorConfig({ templateEngine })` 让画布、编辑器预览和解析导出共用外部引擎；`renderTemplatePreview()`、文档及单区块渲染支持相同的 `templateEngine` 选项。
- 导出 `defaultTemplateEngine` 与按需调用的 `validateTemplate()`；语法校验不会自动阻止保存。引擎更新保留文档与实例，多实例之间独立，传入引擎的数据为隔离副本。
- 默认引擎支持基础变量、根上下文及 `if/range/with`；包含未支持语法或不完整控制结构时保留该次渲染的完整输入。函数、管道及局部变量交由外部引擎处理，外部输出不重复转义。
- 统一画布、预览和发送 HTML 的变量清单补点规则，保留空白与 trim 标记；JSON 保存模板原文。
- 修复 Unicode 字段路径解析，以及 Date、Map、Set 和普通对象的条件真值判断；渲染与校验将非 `Error` 异常归一化并保留原始 `cause`，支持错误提示、Retry 及更换引擎恢复。
- 新增中英文模板引擎独立文档与接入示例，README 仅保留文档引用。

### 工具链与文档

- 项目包管理器从 pnpm 迁移为 npm 11.13.0，使用 `package-lock.json` 替换 `pnpm-lock.yaml`，保持所有直接依赖版本不变。
- 开发启动统一使用 `npm install` 和 `npm run dev`；固定锁文件安装使用 `npm ci`。检查、自动修复、打包和发布前校验脚本均改为 npm，移除 pnpm 专属配置。
- 同步中英文 README、API 开发与本地联调说明、发布指南及项目协作规则中的安装和命令说明。

### 验证

- `npm ci` 安装成功；`npm run check` 通过类型检查、Oxlint、构建及全部 121 项 Node 测试，覆盖模板引擎选择、上下文、转义、数据隔离、变量补点与异常恢复。
- `npm run dev` 启动成功，首页和 `main.tsx` 入口模块均返回 HTTP 200。
- Chrome 验证画布与预览的变量结果，以及非 `Error` 异常提示、Retry 和更换引擎恢复；`git diff --check` 通过。

## 0.4.3 — 2026-10-28

### 修复与改进

- 主题 header 与配置区复用同一个 Personalization 菜单，统一变量颜色、宽度、圆角、阴影和 hover 样式。
- 将配置区文本、多行文本与链接字段的变量入口移至输入框右侧后缀，预留内容空间；插入变量后恢复输入焦点和光标位置。
- 菜单按视口空间向左或向上展开，使用原生 popover 避免滚动裁切及带 `transform` 的嵌入容器引起的定位偏移。
- 补齐键盘打开时的焦点、Tab/Shift+Tab 退出、Escape 关闭与外部点击关闭；关闭菜单时保留当前区块选择，并清理观察器及事件监听器。
- 保持公开 API、邮件导出和 `version: 4` 文档格式不变。

### 验证

- `pnpm check` 通过，包含类型检查、Oxlint、构建及全部 103 项 Node 测试；新增菜单定位、焦点、关闭与生命周期回归测试。
- 复用现有开发服务完成浏览器交互验收，覆盖后缀点击、光标插入、键盘导航及带 `transform` 容器中的定位。

## 0.4.2 — 2026-10-28

### npm 发布与文档

- 补齐 MIT 许可证、仓库、主页和 Issue 地址，固定公开 npm registry 与 pnpm 10.16.1，并通过 `.nvmrc` 推荐 Node 24 LTS。
- 新增 `pnpm test`、`pnpm check` 和发布前完整校验；通过 `sideEffects` 保留 CSS，并验证消费方可以移除未使用的 JavaScript 导入。
- 修复 npm README 图片失效：中英文图片与查看链接改用已发布 0.4.1 资源的固定绝对 CDN 地址；新版包不重复携带 PNG 原图，保留 Markdown 和 SVG 文档。
- 中英文 README 的语言切换、API、示例、发布指南、更新日志及章节导航统一使用 GitHub 绝对地址，并验证目标文档和锚点存在；远端文档需随提交一并推送。
- 补充中英文发布指南、发布文件范围与 CSS 消费验证；保持 React 18 peer 范围及现有公开 API、文档格式不变。

## 0.4.1 — 2026-10-28

### 文档与类型提示

- 精简中英文 README，增加模块架构图，并将完整接入说明整理为独立的 API 参考、基础场景和复杂场景文档。
- 补充保存恢复、主体与变量、多实例订阅、自定义区块、多区域富文本、图片资源选择器及单区块模板预览示例，同步更新自定义区块指南的文档导航。
- 为编辑器实例、文档模型、插件与控件、邮件渲染工具、富文本及基础 UI 组件补充英文 JSDoc，随 TypeScript 声明发布，便于 IDE 悬停查看参数、默认值及行为边界。
- 本次仅更新文档、类型注释和包版本，不改变运行时行为、公开 API 或持久化文档版本；文档仍为 `version: 4`。

### 验证

- 类型检查、Oxlint、构建和全部 96 项 Node 测试通过。
- 中英文 README、API 参考及场景文档的 34 个 TypeScript/TSX 示例文件通过类型检查，文档本地链接目标均存在。

## 0.4.0 — 2026-10-28

### 新增与改进

- React 接入统一使用 `useEmailEditorConfig()`、`useEmailEditor()` 和 `<EmailEditor editor={editor}>`；新增 `useEmailEditorState(editor)` 按需订阅缓存的只读文档快照。
- 编辑器实例引用稳定且互相隔离，无需挂载界面即可读取、校验及导出；提供 `setDocument()` 和 `reset()`，替换或重置时清空旧文档的选择、焦点与控件状态。
- 配置与变量更新保留当前文档；外部主体输入按值变化合并，初始化不触发回调，文档读取及回调参数保持独立快照。
- playground 增加导出、新建、重置与订阅示例，中英文接入文档同步更新。

### 修复与验证

- 配置、变量、主体及回调在提交阶段同步，子组件的 layout effect 可读取新值；订阅通知及主体回调延后到 layout 阶段，被中断的并发 render 不改变现有实例。
- 主题输入框使用实例级 ID，多个编辑器的标签、输入框和字数提示独立关联。
- 补齐配置更新时序、并发中断、多实例主题关联、旧 API 负向类型契约和源码兼容入口检查。

### 不兼容变更

- 移除公开 `createEmailEditorConfig`、`EmailEditorConfigOptions`、`EmailEditorHandle`、组件 ref 和旧状态 Props，不提供别名或兼容层。配置与状态改为传给 `useEmailEditor()`，组件只接收 `editor` 和 `height`。
- `blockToHtml()` 和 `renderBlockContent()` 的第四个参数仅接受 `BlockRenderOptions` 对象；移除 boolean 参数适配，JavaScript 传入 boolean 时明确报错。模板预览改用 `{ resolveHtmlTemplate: true }`。
- 持久化文档继续使用 `version: 4`，不迁移旧版本；本次版本号变化仅涉及包 API 与行为。

## 0.3.0 — 2026-10-28

### 新增与改进

- 新增 `defineBlock()`、`EmailControls` 和 `createEmailEditorConfig()`，编辑器与独立邮件导出共用插件配置；内置区块库支持筛选、排序和显式覆盖。
- 区块插件支持自定义控件组件、React Canvas/Inspector、多区域 `EditableRichText`、`ControlEditor`、声明式嵌套列表、图片资源选择器与统一邮件 HTML 工具。
- 新增 `config.validate()`，汇总数字范围、选项、URL/图片协议、列表数量及业务校验问题；`setControls()` 支持一次更新多个关联控件。
- 补充中英文自定义区块 API 文档、优惠券及商品卡片示例，以及组件级回归测试。

### 修复

- 修改链接 URL 或打开方式时保留已有的显式颜色和下划线，重置后恢复继承 BODY。
- 画布主体使用与预览及邮件导出一致的基础排版，修复 `em` 内边距、边框等尺寸的计算差异。
- 修复列表异步回写覆盖后续编辑或排序的问题；按稳定行标识合并最新值，删除或卸载后忽略过期结果，新行不复用已删除行的标识。
- 自定义控件接收独立的值、主体配置和变量快照，避免直接修改参数污染宿主；自定义 Canvas/Inspector 的变量同步隔离。
- 可选下拉框显示空选项并支持清空；控件标签正确关联下拉框。
- 检查器富文本继承主体及已启用的区块排版、段落、列表和链接样式，主体配置变化后同步更新。
- 缺失插件或邮件导出失败时明确报错；画布和检查器异常按区块隔离，并保留原始节点数据。

### 不兼容变更

- 自定义区块改为 `defineBlock` + `EmailControls` + `createEmailEditorConfig`，组件接收 `config`；移除旧 `blocks` Prop、公开 `BlockDefinition/FieldConfig/FieldType` 和 `resolveBlockStyleFields`，不保留适配层。控件工厂使用 `EmailControls.text(...)`，区块及列表通过 `controls` 声明控件（不保留 `field` / `fields` 别名）；运行时、持久化节点统一使用 `controls`，样式声明使用 `styleControls`，更新方法使用 `setControl/setControls`，配套类型、`ControlEditor` 和 `controlPath` 同步更名。内容默认值来自控件声明，渲染函数改为 `renderEmail`，文档格式升为 v4，不兼容旧数据、不提供自动迁移。
- 邮件主体设置统一改为 `body`：文档使用 `EmailDocument.body`，组件使用 `body` / `onBodyChange`，类型及工具改为 `EmailBodySettings`、`DEFAULT_EMAIL_BODY`、`resolveEmailBody`；区块渲染上下文和 `BlockRenderOptions` 同步使用 `body`。移除旧 Global API，不保留别名或迁移代码。
- 文档版本升为 `4`，不支持旧版本。BODY 的 General 提供文字颜色、链接颜色、字体、字重和链接下划线开关；Content 提供唯一主体 Background、内容宽度、Padding 和区块间距，边框颜色、宽度及样式收进默认折叠的 Advanced: Border。配置同步用于画布、预览和导出，内容显式格式保持优先。仅保留 `contentPadding` 内边距，移除 `outerPadding`、主体对齐、外侧背景和圆角配置；主体固定居中，外侧固定白色。

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
