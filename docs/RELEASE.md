# Release Checklist

This checklist applies to every release of `@oxog/cli`. It keeps the published tarball, public exports, and consumer type experience aligned.

## Prepare

- [ ] Review `CHANGELOG.md` and move the relevant **Unreleased** entries to the target version with its release date.
- [ ] Confirm `package.json` has the intended version and that `dependencies` remains empty with no `peerDependencies`.
- [ ] Confirm `README.md`, package exports, and changelog notes describe the same public API.

## Verify

Run these commands from the repository root:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run prepublishOnly
npm pack --dry-run --json
```

`prepublishOnly` is the required release gate: it builds ESM, CJS, and DTS outputs and runs the coverage suite. The coverage thresholds in `vitest.config.ts` must remain at or above 95% for lines, functions, branches, and statements.

Inspect the `npm pack --dry-run --json` file list. It must contain only:

- `package.json`, `README.md`, and `LICENSE`;
- runtime bundles and declaration files under `dist/`.

It must not contain source files, tests, documentation, website assets, coverage output, or source maps.

## Consumer smoke test

Create an isolated temporary project outside the package directory, install the generated tarball, and verify these public specifiers in both ESM and CommonJS:

- `@oxog/cli`
- `@oxog/cli/plugins`
- `@oxog/cli/config`
- `@oxog/cli/decorator`

Run a strict TypeScript consumer check using `module` and `moduleResolution` set to `NodeNext` with `skipLibCheck: false`. Remove the temporary tarball and consumer project after the check.

## Publish

- [ ] Run `npm publish --dry-run` when the environment permits the npm publish subcommand.
- [ ] Publish with the intended npm access and tag only after all prior checks pass.
- [ ] Verify the published package from a clean consumer project and then tag/push the release commit according to the repository release policy.
