# 项目协作规则

本文档是本仓库的项目级规则，适用于整个仓库。任何 agent 在修改本项目代码前都必须先阅读本文档；规则必须能在没有本机 Skill、个人配置或专用编辑器的环境中独立执行。本文件是唯一完整规范，避免维护多份容易漂移的规则。对于不会自动读取 `AGENTS.md` 的工具，使用者须将本文件配置为项目指令或在任务中明确要求读取；文档本身不能强制所有工具自动加载。

仓库根目录的 `package.json`、`tsconfig.json`、`tsup.config.ts` 和本文件共同构成开发约定。实际脚本、配置和源码是可执行事实；发现本文件与实现不一致时，核实后同步更新规则，不要静默假定二者一致。更高优先级的系统/工具指令和用户当前明确要求优先；子目录规则只适用于其范围，不得自行放宽 Git 提交授权等全仓库边界。

沟通、计划、任务拆解、变更说明和新增项目规范默认使用中文，保留代码标识、命令、路径和专有名词原文。现有产品 UI 文案沿用所在模块语言，不顺手翻译。

## 项目定位

本项目是 `@standhigher/react-email-editor` React 组件库，使用 TypeScript、React 18、`@dnd-kit` 和 TipTap。它是一个可发布的 ESM 包，不是带独立页面和开发服务器的应用。

核心行为如下：

- 邮件文档是 JSON 数据，`EmailDocument` 是编辑器状态的单一事实源。
- 编辑器由区块库、画布/预览、检查器和 shell 组成。
- 区块通过 `BlockDefinition` 注册，字段和样式配置驱动检查器，`render(ctx)` 生成 HTML 字符串。
- `render(ctx)` 的 `mode` 为 `canvas` 或 `email`；画布展示编辑辅助界面，邮件模式生成可交付 HTML。
- HTML 区块可以包含 Go template 风格变量，例如 `{{.customer_name}}`、`{{range .products}}`。导出应保留模板，只有预览或显式请求时才解析模板。
- `getData()`、`getDocument()`、`getJson()`、`getHtml()` 等公开 API 返回独立数据快照；不得让调用方修改快照时意外改变编辑器内部状态。
- 包不内置 React、React DOM、TipTap 或 dnd-kit；这些依赖由消费方解析，必须保持 peer dependency 和构建 external 约定。

## 开始工作前

1. 阅读本文件及与任务直接相关的源码、测试和 README。
2. 运行 `git status --short`，确认工作区已有修改。已有修改属于当前工作，不得覆盖、回滚或格式化无关文件。
3. 先定位现有实现和调用方，再决定是否新增抽象。不要凭个人习惯引入新的目录层级、状态管理库、CSS 框架或构建系统。
4. 如果任务涉及公开 API、文档结构、渲染结果或默认值，先检查 `src/index.ts`、`src/types/`、`src/document/`、`src/render/` 和相关测试。
5. 如果任务涉及 UI，先确认是否已有消费方开发服务或浏览器页面；优先复用已有服务，不要为本组件库擅自启动新的预览服务。

## 目录与职责

```text
src/
  EmailEditor.tsx       对外组件入口
  index.ts              包公共导出，只保留稳定 API 的显式 re-export
  types/                公共数据模型、Props、渲染上下文和配置类型
  shell/                编辑器会话、ref handle、主题栏和个性化入口
  stage/                画布、预览、富文本编辑和工具栏
  block-library/        可拖拽区块库
  editor-dnd/           拖拽上下文和拖拽数据
  inspector/            全局/区块字段、样式控制器及检查器组件
  blocks/               内置区块定义、字段配置、图标和注册表
  document/             文档/区块创建、默认值、注册表和 mutations
  render/               画布/邮件渲染、模板预览和文档 HTML 输出
  utils/                跨模块且无业务界限的工具函数
  constants/            跨模块固定配置
  styles/               编辑器 CSS，按功能拆分
  styles.css            CSS 总入口，负责按顺序导入 styles/ 下文件
scripts/
  copy-style.mjs        构建成功后复制并展开 CSS 到 dist/styles.css
tests/
  *.test.mjs            Node 原生测试，测试构建产物和公开行为
```

新增文件前必须判断归属层级：只服务一个业务模块的组件或工具留在该模块；跨模块的无业务工具放 `src/utils/`；稳定跨模块配置放 `src/constants/`；对外类型放 `src/types/`。不要创建万能 `utils`、重复 barrel 文件或仅为“看起来整齐”而增加目录。

## 代码结构

- React 组件使用 `.tsx`，普通逻辑和类型使用 `.ts`。文件名沿用现有约定：组件使用 PascalCase，hooks 使用 `useXxx`，多词工具/配置文件优先使用 kebab-case（例如 `create-document.ts`、`block-html.ts`）。修改现有文件时不为命名统一而无关重命名。
- 一个组件文件只能包含一个 React 组件（同一组件的 forwardRef/memo 包装不算额外组件）。工具方法、常量、复杂子组件和独立 hook 应拆到职责明确的文件；非业务子组件放当前模块的 `components/`，共享工具放最接近使用方的 `utils.ts` 或按职责拆分的 `utils/`。新增或继续扩展的文件超过约 350 行，或承担三个及以上明显职责时，必须先按职责拆分再继续实现；生成文件和测试 fixture 除外。不对任务范围外的现有大文件进行无关重构。
- `src/index.ts` 是公共包入口，只显式导出稳定 API、公共类型和必要注册项；内部文件直接导入具体模块，避免内部多层 barrel re-export。
- 入口组件只负责组合和转发；参数解析、状态会话、渲染、字段转换等逻辑放在对应模块。
- 固定区块列表、字段元数据、默认配置、选项映射和常量不能散落在组件 JSX 中，应放在最接近职责的 `constants.ts`、配置文件或区块定义文件中。
- 不要为了提前抽象而新增层级。只有在消除实际重复、降低复杂度或匹配已有模块边界时才抽象。

## TypeScript 规则

- `tsconfig.json` 开启 `strict`、`isolatedModules` 和 `moduleResolution: bundler`；新增代码必须通过严格类型检查，不得通过关闭配置来绕过错误。
- 对象形状默认使用 `interface`：Props、State、文档模型、接口结果、配置项和上下文都遵循此规则。联合类型、函数类型、交叉/映射类型以及 `Pick`/`Omit` 等工具类型使用 `type`。
- 优先使用已有的 `EmailDocument`、`EmailBlockNode`、`EmailBlockStyle`、`BlockDefinition`、`FieldConfig`、`StyleFieldConfig` 等类型，不要在不同文件重复声明同一对象结构。
- 对外类型变化必须同步检查 `src/index.ts` 导出、README 示例和测试；能保持向后兼容时不要无理由破坏现有字段。
- 不使用 `any` 掩盖类型问题。确需处理未知外部数据时先使用 `unknown`，再通过类型守卫、默认值归一化或明确的窄化处理。
- 保持现有 ESM import 风格和 `.ts/.tsx` 源码导入方式；不要为了个人工具链添加 CommonJS 入口。

## 文档与数据模型

- 文档创建和归一化统一经过 `src/document/create-document.ts` 的 `createEmailDocument`、`resolveEmailGlobal`、`ensureEmailDocument` 等函数；不要在组件中复制默认值或自行拼装不完整文档。
- 区块创建统一优先使用 `createBlockNode()`，默认字段、默认样式和 `defaultData` 必须从 `BlockDefinition` 派生，并在需要时使用深拷贝，避免共享可变对象。
- `EmailDocument.version` 是持久化版本字段。变更数据结构时必须检查默认值、导出兼容性和版本语义，并补充测试。当前 README 明确处于开发阶段、不迁移旧版区块字段；不要无需求增加迁移框架。若任务涉及存量文档兼容，先明确支持范围，再实现归一化或迁移。
- mutations 应保持状态更新边界清晰，避免直接修改不属于当前操作的对象。对外快照和重置逻辑必须保持独立引用。
- 全局样式与区块样式分层：区块容器使用 `dimension`、`decorations`、`typography`，按钮/图片/分割线等元素自身样式使用 `element`。不要混淆容器和元素样式的语义。
- CSS 值应使用现有 `src/utils/css-values.ts` 的归一化和校验函数；不要在多个模块重复实现长度、颜色、边框或间距解析。

## 渲染与邮件 HTML

- `src/render/` 中的函数应尽量保持纯函数：相同文档、定义、全局配置和模板数据应得到相同结果，不读取浏览器全局状态，也不依赖编辑器 React 状态。
- `blockToHtml`、`renderBlock`、`documentToHtml` 以及模板预览的职责必须保持清晰。修改渲染链时同时检查 canvas、email、preview 三种使用路径。
- 邮件 HTML 使用表格布局和内联样式以兼容邮件客户端。不要把编辑器的拖拽边框、选中态、工具栏、空画布提示或其他 `ree-*` 编辑辅助 UI 输出到邮件。
- 文档导出必须只生成一个完整的 `<!DOCTYPE html>`、`<html>`、`<head>` 和 `<body>`；HTML 区块输入的完整文档需要按现有逻辑合并，不能产生嵌套 `html`/`head`/`body`。
- 默认导出保留 Go template 原文。只有传入 `resolveHtmlTemplates` 或预览专用路径时才解析模板；区块 `defaultData` 优先于同名全局变量，具体合并规则沿用现有实现。
- 普通文本和属性插值使用 `src/utils/html.ts` 的现有转义工具，CSS 值先归一化再输出；URL 的协议安全与 HTML 转义是不同问题，新增 URL 入口需校验允许的协议。显式 HTML 区块和富文本按现有 HTML 内容路径处理，不能整体转义成纯文本，也不能把模板预览器当作完整 Go 引擎或安全沙箱。属性转义不等于 HTML 消毒，不得声称已有逻辑能安全执行任意不可信 HTML。
- 新增区块必须完整考虑：定义、字段、默认字段、默认样式、注册表、画布展示、邮件输出、模板数据和测试；不得只让画布能显示而邮件导出缺失。

## React 与 UI

- 这是一个无 UI 框架的组件库，不要引入 Tailwind、CSS-in-JS 或新的组件库来替代现有 CSS 体系。静态编辑器布局、间距、状态、响应式规则写入 `src/styles/`；运行时动态值可按现有模式使用 CSS 变量或内联样式。
- 项目自有编辑器 CSS 类名使用 `ree-` 前缀，CSS 变量使用 `--ree-` 前缀。TipTap/CodeMirror 等依赖生成的 `.ProseMirror`、`.cm-*` 等类名保留原名，对其样式覆盖必须限定在 `.ree-*` 容器内，避免污染消费方页面。新增样式按功能放入对应文件，并在 `src/styles.css` 中维护导入顺序。不要在组件内写大段静态 style object。
- 画布显示和邮件渲染是两套消费场景：编辑辅助样式只能留在编辑器 CSS；邮件渲染需要明确的内联 CSS 或渲染器输出。
- 提供原型、设计稿或验收 URL 时，改动前后必须按模块对照参考与实际页面采样 DOM、computed style 和交互状态，覆盖任务涉及的静态样式、hover、点击、弹窗、响应式及 iframe 场景；不能只凭代码判断还原完成。优先复用当前 Chrome/浏览器窗口和已有服务；只有确认服务不可用、端口不匹配或用户明确要求时才启动新服务，并说明原因。
- 响应式优先使用现有 CSS 媒体查询和容器规则；不要为了简单断点新增屏幕宽度 hook。桌面/移动只改变外层宽度时复用同一内容组件。
- 交互状态必须完整：拖拽、选择、编辑、预览切换、重置、空状态、错误状态和 loading 状态应沿用当前模块的表现方式。新增异步交互时必须处理 loading、error/retry、empty 等状态。
- TipTap、dnd-kit 和其他依赖的生命周期必须跟随现有 hook/组件模式；不要在渲染期间创建编辑器实例或注册全局监听器而不清理。
- 无障碍基础要求：按钮使用正确 `type`，交互元素优先使用原生语义，图标按钮提供可识别标签，输入控件保持 label/关联关系，键盘操作不能被鼠标专用逻辑破坏。

## 新增或修改区块

区块定义通常放在 `src/blocks/<type>.ts`，公共字段配置放在 `style-fields.ts` 或同职责配置文件中。实现时遵循以下顺序：

1. 定义稳定的 `BlockDefinition`，包括 `type`、`title`、`fields`/`styleFields`、默认值、必要的 `defaultData` 和 `render`。
2. 在 `src/blocks/registry.ts` 注册，必要时补充图标和创建逻辑。
3. 确认 `createBlockNode()` 能产生独立的完整节点。
4. 确认检查器能读写字段和样式，画布能编辑/选择，预览和 `documentToHtml()` 能输出正确邮件 HTML。
5. 为默认值、样式继承、空值、模板变量和最终 HTML 写有意义的测试。

区块的静态配置不要内联到无关组件；区块渲染函数不要承担编辑器选择、拖拽或 React 状态管理。

## CSS 与构建产物

- `src/styles.css` 是 CSS 总入口；`tsup.config.ts` 的 `onSuccess` 调用 `scripts/copy-style.mjs`，构建后生成展开的 `dist/styles.css`。
- 不要手工编辑 `dist/`；它是构建产物，已被 `.gitignore` 忽略。需要验证 CSS 时先运行 `pnpm build`。
- 不要提交 `node_modules/`、`dist/`、`*.tsbuildinfo`、`.DS_Store` 或调试截图/临时文件。
- `tsup.config.ts` 的 ESM、dts、external、`"use client"` banner 和 CSS 复制行为是发布契约。修改前必须确认消费方和 README 仍然适用。

## 测试与验证

默认使用 pnpm，并在项目根目录执行。仓库使用 `pnpm-lock.yaml`，不混用 npm/yarn 锁文件。依赖未安装时优先运行 `pnpm install --frozen-lockfile`；仅在任务确实改变依赖时更新清单和锁文件。当前仓库未声明 `engines` 或 `packageManager`，不得假定团队成员拥有某个个人路径下的 Node/pnpm；首次使用应检查 `node --version` 和 `pnpm --version`，采用依赖支持的 Node LTS。

```bash
pnpm typecheck
pnpm lint
pnpm build
node --test tests/*.test.mjs
```

验证要求：

- 当前工程缺口：`package.json` 声明了 `lint: eslint src`，但没有声明 ESLint 开发依赖，也未提供 ESLint 配置；干净环境下 lint 不能保证运行。遇到 `eslint: command not found` 等环境失败必须报告原因，并继续执行可用检查，不得标记为全部通过。不得依赖全局 ESLint或使用临时下载掩盖问题；在工程化任务中补齐仓库内依赖与配置后再更新本说明。
- 文档-only 修改检查路径、命令、规则与源码是否一致，并运行 `git diff --check`；无需为纯文档改动添加实现测试或启动浏览器。
- TypeScript、公共 API、文档模型或渲染逻辑变更：至少运行 `pnpm typecheck`、`pnpm lint`、`pnpm build` 和相关 Node 测试；lint 暂不可用时按上述工程缺口报告。
- UI/CSS/字段交互变更：至少运行 `pnpm typecheck`、`pnpm lint`、`pnpm build`；若有可用消费方页面，复用已有服务和浏览器做 DOM、computed style、hover、点击展开、弹窗、分页、响应式或 iframe 场景的实际验证。
- `tests/*.test.mjs` 依赖构建后的 `dist/index.js` 和 `dist/styles.css`，必须先构建再运行；不要只测试 `src` 的假入口。
- 只运行了部分检查时，最终报告必须明确列出实际运行的命令和结果；不能把未运行的检查写成已通过。
- 浏览器或跨域 iframe 无法操作时，明确记录限制和未覆盖的交互，不要声称完成了点击级验证。
- 测试验证公开行为和实际回归风险，不为小型可逆改动编写仅重复实现细节的测试。检查通过后不无理由重复执行或扩大验证范围。
- 任务结束前清理仅为本轮调试创建且不再需要的临时测试文件、类型声明、截图和中间产物；保留正式回归测试、交付物及联调仍需使用的构建产物，不删除项目原有文件。

## README 与公开契约

涉及以下内容时同步更新 README：公开 Props/Handle、文档字段、默认值、渲染/模板行为、安装方式、构建/link 联调方式、发布内容或消费方配置。示例必须能反映当前 API；不要留下与实现不一致的旧字段或命令。

## Git 与变更边界

- 只修改完成任务所需的文件。不要顺手重排无关代码、批量格式化全仓库或覆盖工作区已有改动。
- 不擅自提交。完成代码、测试和变更摘要后先交给用户 review；只有用户明确回复“提交”“可以提交”等确认后，才执行 `git add` / `git commit`。
- 提交信息遵循 Conventional Commits：`<type>: 中文摘要`，不添加 `(scope)`，例如 `fix: 修复邮件区块样式继承`。正文用中文说明影响范围、修改范围、主要行为变化和验证结果；拆分提交时每个提交分别写清对应范围。
- 只暂存和提交用户授权的文件或变更片段，不使用 `git add .` / `git add -A` 混入其他会话改动。提交前检查暂存区；已有不相关暂存内容不得擅自重置或包含在本次提交中。
- 提交前再次运行 `git status --short` 和必要的验证命令，确认没有临时文件、构建产物或不相关改动进入提交。

## 完成前自检

- 是否阅读并遵守本文件，而不是依赖个人机器上的 Skill 或编辑器设置？
- 是否保持了现有模块边界、公共导出、数据模型和渲染契约？
- 新增对象形状是否使用 `interface`，联合/工具类型是否合理使用 `type`？
- 是否考虑了 canvas、email、preview 和消费方 API 的影响？
- 是否更新了必要的 README、测试和 CSS 总入口？
- 是否实际运行了与改动相关的检查，并在回复中报告结果？
- 是否清理了本轮产生的临时文件，并保留了用户已有改动？
