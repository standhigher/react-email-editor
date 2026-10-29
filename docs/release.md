# npm release guide

English | [简体中文](./release.zh-CN.md)

## Toolchain and package configuration

Development uses Node 24 LTS (`.nvmrc`) and npm 11.13.0 (`packageManager`). The complete test suite needs Node 22.18+. These development requirements are not consumer requirements, so the package does not declare `engines`. React / React DOM 18 remain the supported peers; React 19 requires a separate compatibility validation.

The manifest declares MIT licensing, repository, homepage, issue tracker and the public npm registry. `sideEffects: ["**/*.css"]` preserves CSS imports while allowing unused JavaScript modules to be removed. Actual tree shaking depends on module contents and the consumer's bundler.

The package includes built assets, Markdown documentation and SVGs under `docs/` (including [English](./changelog.md) and [Chinese](./changelog.zh-CN.md) changelogs), plus both READMEs. npm automatically includes `package.json` and `LICENSE`. Source, playground, tests, caches and PNG originals are excluded.

## README images

Both READMEs use absolute CDN URLs pinned to the publicly published `0.4.1` package, which contains the English and Chinese PNG and SVG assets. This avoids relative-path resolution on npm, GitHub branch synchronization and shipping PNG copies in every release.

When updating a diagram, host the new image at a stable public URL before changing either README. Do not reference an unpublished version or a `latest` URL that may no longer contain PNGs. Verify an unauthenticated `200` response and the correct image Content-Type.

README language switches, documentation, changelog and section links use absolute GitHub `blob/main` URLs. Push the corresponding commit before publishing so the linked READMEs, `docs/` and changelog exist on GitHub; local-only files still return 404. Relative links inside documentation pages are resolved by GitHub against their directories.

## Local checks and publishing

```bash
npm ci
npm run check
npm pack --dry-run
```

`npm run check` runs type checking, linting, build and Node tests in order. Tests cover package contents, README image URLs and consumer CSS preservation. `npm test` requires an existing build. `prepack` builds assets; `prepublishOnly` runs the complete check before local publishing.

To publish locally, first update both changelogs and select an unpublished version:

```bash
npm login --registry=https://registry.npmjs.org/
npm publish
```

The npm account needs permission for the `@standhigher` scope and any required 2FA. Published versions cannot be overwritten. Committing or pushing code does not automatically publish a package.
