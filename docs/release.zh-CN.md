# npm 发布指南

[English](./release.md) | 简体中文

## 工具链与包配置

开发默认使用 Node 24 LTS（`.nvmrc`）和 pnpm 10.16.1（`packageManager`）。完整测试最低需要 Node 22.18；这不是消费方安装要求，因此包没有添加 `engines` 限制。当前仍只声明 React 18 / React DOM 18 支持，React 19 需完成独立兼容性验证后再扩大 peer 范围。

`package.json` 声明 MIT 许可证、仓库、主页、Issue 地址及公开 npm registry。`sideEffects: ["**/*.css"]` 保留消费方的 CSS 导入，允许 bundler 丢弃未使用的 JavaScript 模块；实际裁剪效果取决于模块内容和消费方 bundler。

`files` 只发布构建产物、`docs/` 下的 Markdown 文档和 SVG（含[英文](./changelog.md)与[中文](./changelog.zh-CN.md)更新日志），以及中英文 README；npm 自动包含 `package.json` 和 `LICENSE`。源码、playground、测试、本地缓存和 PNG 原图不进入包。

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

需要本地手动发布时，在确认版本未发布、中英文更新日志已同步后执行：

```bash
npm login --registry=https://registry.npmjs.org/
npm publish
```

发布需要 npm 账号对 `@standhigher` scope 的权限及账号要求的 2FA。已发布的相同版本不能覆盖。代码提交或推送不会自动发布 npm 包。
