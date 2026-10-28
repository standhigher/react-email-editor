# npm 发布指南

[English](./release.md) | 简体中文

## 工具链与包配置

开发及 CI 默认使用 Node 24 LTS（`.nvmrc`）和 pnpm 10.16.1（`packageManager`）。完整测试最低需要 Node 22.18；这不是消费方安装要求，因此包没有添加 `engines` 限制。当前仍只声明 React 18 / React DOM 18 支持，React 19 需完成独立兼容性验证后再扩大 peer 范围。

`package.json` 声明 MIT 许可证、仓库、主页、Issue 地址及公开 npm registry。`sideEffects: ["**/*.css"]` 保留消费方的 CSS 导入，允许 bundler 丢弃未使用的 JavaScript 模块；实际裁剪效果取决于模块内容和消费方 bundler。

`files` 只发布构建产物、Markdown 文档和 SVG，以及 README、更新日志；npm 自动包含 `package.json` 和 `LICENSE`。源码、playground、测试、工作流、本地缓存和 PNG 原图不进入包。

## README 图片

npm README 使用固定版本的绝对 CDN 地址，图片来自已公开发布的 `0.4.1` 包。中英文 PNG 和 SVG 源文件均由该版本提供，不依赖本地相对路径或 GitHub 分支同步，也不需要在每个新版包中重复分发 PNG。

更新架构图时，先将新图片放到可公开读取的稳定地址，再更新两个 README 的图片与查看链接。不要把地址替换成尚未发布的版本，也不要使用会随 `latest` 变化且可能缺失 PNG 的路径。图片地址应无需登录，返回 `200` 和正确的图片 Content-Type。

README 的语言切换、文档、更新日志和章节导航使用 GitHub `blob/main` 绝对地址。发布前须先推送相应提交，确保 GitHub 上的 README、`docs/` 与更新日志均已同步；仅在本地存在的文档仍会返回 404。文档页内部的相对链接继续由 GitHub 按目录解析。

## 本地检查与发布

```bash
pnpm install --frozen-lockfile
pnpm check
npm pack --dry-run
```

`pnpm check` 顺序执行类型检查、lint、构建和 Node 测试；测试包含发布文件范围、README 图片地址及消费方 CSS 保留验证。`pnpm test` 只执行测试，需先构建。`prepack` 负责构建；本地 `npm publish` 的 `prepublishOnly` 会执行完整校验。

需要本地手动发布时，在确认版本未发布、更新日志已同步后执行：

```bash
npm login --registry=https://registry.npmjs.org/
npm publish
```

发布需要 npm 账号对 `@standhigher` scope 的权限及账号要求的 2FA。已发布的相同版本不能覆盖。本轮代码提交本身不会发布 npm 包。

## GitHub Actions 与 Trusted Publishing

`.github/workflows/ci.yml` 在 main 推送和 PR 时检查 Node 22、24。发布工作流 `publish.yml` 只通过 Actions 的 **Run workflow** 手动启动，输入一个已有的稳定版本标签；推送提交、创建标签或 GitHub Release 均不会自动发布。

首次使用前，在 npm 包 Settings → Trusted publishing 添加 GitHub Actions：

| 字段 | 值 |
| --- | --- |
| Organization or user | `standhigher` |
| Repository | `react-email-editor` |
| Workflow filename | `publish.yml` |
| Environment name | 留空；当前工作流未绑定 Environment |

这些 npm 网站设置需要包维护者完成，提交工作流不会自动建立信任。包与源码仓库需公开，以生成 provenance。工作流使用 GitHub 托管 runner、Node 24 及其 npm（需至少 11.5.1），通过 `id-token: write` 获取短期 OIDC 凭据，无需保存 npm 写入 token。

发布流程：

1. 在发布提交中更新 `package.json` 版本和 `CHANGELOG.md`，完成 review 后提交并推送。
2. 创建并推送匹配包版本的标签，例如版本 `0.4.2` 使用 `v0.4.2`。
3. 在主分支的 **Publish to npm → Run workflow** 输入该标签。
4. 工作流检出标签，校验 `vX.Y.Z` 与包版本完全一致，安装锁定依赖并运行 `pnpm check`，最后公开发布并生成 provenance。

发布步骤使用 `--ignore-scripts`，因为同一工作流已完成完整校验与构建，避免重复执行生命周期脚本。预发布版本目前不由该工作流处理；需要时应另外设计 dist-tag，避免误发到 `latest`。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)。
