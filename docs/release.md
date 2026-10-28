# npm release guide

English | [简体中文](./release.zh-CN.md)

## Toolchain and package configuration

Development and CI use Node 24 LTS (`.nvmrc`) and pnpm 10.16.1 (`packageManager`). The complete test suite needs Node 22.18+. These development requirements are not consumer requirements, so the package does not declare `engines`. React / React DOM 18 remain the supported peers; React 19 requires a separate compatibility validation.

The manifest declares MIT licensing, repository, homepage, issue tracker and the public npm registry. `sideEffects: ["**/*.css"]` preserves CSS imports while allowing unused JavaScript modules to be removed. Actual tree shaking depends on module contents and the consumer's bundler.

The package includes built assets, Markdown documentation and SVGs, plus both READMEs and the changelog. npm automatically includes `package.json` and `LICENSE`. Source, playground, tests, workflows, caches and PNG originals are excluded.

## README images

Both READMEs use absolute CDN URLs pinned to the publicly published `0.4.1` package, which contains the English and Chinese PNG and SVG assets. This avoids relative-path resolution on npm, GitHub branch synchronization and shipping PNG copies in every release.

When updating a diagram, host the new image at a stable public URL before changing either README. Do not reference an unpublished version or a `latest` URL that may no longer contain PNGs. Verify an unauthenticated `200` response and the correct image Content-Type.

README language switches, documentation, changelog and section links use absolute GitHub `blob/main` URLs. Push the corresponding commit before publishing so the linked READMEs, `docs/` and changelog exist on GitHub; local-only files still return 404. Relative links inside documentation pages are resolved by GitHub against their directories.

## Local checks and publishing

```bash
pnpm install --frozen-lockfile
pnpm check
npm pack --dry-run
```

`pnpm check` runs type checking, linting, build and Node tests in order. Tests cover package contents, README image URLs and consumer CSS preservation. `pnpm test` requires an existing build. `prepack` builds assets; `prepublishOnly` runs the complete check before local publishing.

To publish locally, first update the changelog and select an unpublished version:

```bash
npm login --registry=https://registry.npmjs.org/
npm publish
```

The npm account needs permission for the `@standhigher` scope and any required 2FA. Published versions cannot be overwritten. Committing this configuration does not publish a package.

## GitHub Actions and Trusted Publishing

`ci.yml` checks Node 22 and 24 on main pushes and pull requests. `publish.yml` only runs through Actions **Run workflow**, with an existing stable version tag as input. Pushes, tags and GitHub Releases do not automatically publish.

Before the first CI release, a package maintainer must configure npm Settings → Trusted publishing:

| Field | Value |
| --- | --- |
| Organization or user | `standhigher` |
| Repository | `react-email-editor` |
| Workflow filename | `publish.yml` |
| Environment name | Leave empty; no Environment is configured |

Committing the workflow does not establish this trust relationship. The package and source repository must be public for provenance. GitHub-hosted runners use Node 24 and its npm (11.5.1+ required), with `id-token: write` for short-lived OIDC credentials. No npm write token is needed.

1. Update `package.json` and `CHANGELOG.md`, review, commit and push.
2. Create and push the matching tag, for example `v0.4.2` for version `0.4.2`.
3. From the default branch, select **Publish to npm → Run workflow** and enter that tag.
4. The workflow checks out the tag, verifies the stable `vX.Y.Z` tag matches the package version, installs locked dependencies, runs `pnpm check`, then publishes publicly with provenance.

The publish step uses `--ignore-scripts` because checks and build already completed in the same workflow. Prereleases are rejected; introduce a separate dist-tag policy before supporting them, to avoid publishing them as `latest`.

Reference: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/).
