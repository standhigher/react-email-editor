# @standhigher/react-email-editor

[English](https://github.com/standhigher/react-email-editor/blob/main/README.md) | 简体中文

把内容拖进画布，调整邮件外观，预览后保存为可继续编辑的 JSON 或导出邮件 HTML。

## 模块架构图

![项目模块架构图：8 个模块及对应功能](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.zh-CN.png)

[查看高清架构图](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.zh-CN.png) · [可编辑 SVG](https://cdn.jsdelivr.net/npm/@standhigher/react-email-editor@0.4.1/docs/assets/architecture.zh-CN.svg)

## 安装与最小接入

需要 React 18 和 React DOM 18；包提供 ESM 和 TypeScript 类型。

```bash
pnpm add @standhigher/react-email-editor
```

```tsx
import { EmailEditor, useEmailEditor } from "@standhigher/react-email-editor";
import "@standhigher/react-email-editor/styles.css";

export function EmailPage() {
  const editor = useEmailEditor();
  return <EmailEditor editor={editor} height={720} />;
}
```

Next.js App Router 的接入组件需声明 `"use client"`；样式在应用允许的全局样式入口引入。保存、上传资源与发送邮件由你的应用实现。

## 本地启动

推荐 Node.js 24 LTS（`.nvmrc`；完整测试最低需要 22.18）和 pnpm 10.16.1（`packageManager`）：

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 [http://localhost:5173](http://localhost:5173)，已有服务时优先复用。构建与校验命令见 [API 文档的开发说明](https://github.com/standhigher/react-email-editor/blob/main/docs/api.zh-CN.md#开发与本地联调)。

## 文档

- [API 参考](https://github.com/standhigher/react-email-editor/blob/main/docs/api.zh-CN.md)：所有公共导出、参数、默认值与类型。
- [基础场景](https://github.com/standhigher/react-email-editor/blob/main/docs/basic-examples.zh-CN.md)：初始内容、保存恢复、主体样式、变量及预览。
- [复杂场景](https://github.com/standhigher/react-email-editor/blob/main/docs/advanced-examples.zh-CN.md)：校验后保存、多实例、自定义区块、多区域编辑、资源适配与独立导出。
- [自定义区块指南](https://github.com/standhigher/react-email-editor/blob/main/docs/custom-blocks.zh-CN.md)：控件、插件和渲染工具的完整说明。
- [发布指南](https://github.com/standhigher/react-email-editor/blob/main/docs/release.zh-CN.md)：发布包校验与本地手动发布。
- [更新记录](https://github.com/standhigher/react-email-editor/blob/main/CHANGELOG.md)。

文档格式仍处于开发阶段，当前只支持 `version: 4`，不自动迁移旧版文档。
