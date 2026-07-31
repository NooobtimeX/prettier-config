# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**prettier-config.dev** — a browser-based Prettier playground / config builder. A
better-than-official Prettier playground: pick a Prettier version + options
visually, paste your code, see a GitHub-style diff, and copy/share the resulting
`.prettierrc`. Everything runs **client-side** — no backend, nothing is sent to a
server. Live at https://prettier-config.dev.

The core trick: `prettier/standalone` and every parser plugin are fetched **at
runtime from jsDelivr CDN** for whatever Prettier 3.x version the user picks, so
the app supports every release without bundling Prettier itself.

## Stack

- **Next.js 16** (App Router, `output: 'standalone'`, `typedRoutes: true`)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (`@tailwindcss/postcss`, CSS-first config in `app/globals.css`)
- **shadcn/ui** (style `base-nova`, base color neutral) on **@base-ui/react**, Lucide icons
- **CodeMirror 6** — the "Your Code" editor (lazy language packs)
- **next-intl** — 20 locales, `localePrefix: 'always'`
- **Bun** is the package manager / runtime (`bun.lock`); npm scripts still work

## Commands

```bash
bun install
bun dev        # next dev on port 2000  → http://localhost:2000
bun run build  # next build
bun start      # next start on port 2000
bun run lint   # eslint --fix && prettier --write .
```

There is **no test suite**. Verify changes by running `bun dev` and exercising the UI.

To exercise the exact image Railway ships:

```bash
docker build -t prettier-config . && docker run --rm -e PORT=2000 -p 2000:2000 prettier-config
```

## Architecture & data flow

Single main screen: [app/[locale]/page.tsx](app/[locale]/page.tsx) (`'use client'`).
It composes three pieces of state and wires the dialogs/panels:

1. **Persisted config** — [hooks/usePersistedConfig.ts](hooks/usePersistedConfig.ts)
   holds `{ version, selected, pluginIds }` in `localStorage` via
   `useSyncExternalStore` (one JSON blob, key `prettier-config-state`, SSR-safe).
2. **Versioned Prettier** — [hooks/usePrettierVersion.ts](hooks/usePrettierVersion.ts)
   → [lib/prettierLoader.ts](lib/prettierLoader.ts). Given a version + extra plugin
   URLs, it CDN-loads `standalone.mjs` + parser plugins, memoizes per
   `(version, plugins)` key, and returns `{ options, format, status, error, pluginFailures }`.
3. **Shareable URL** — [hooks/useShareableUrl.ts](hooks/useShareableUrl.ts) packs
   `version + selected + code + parserOverride + pluginIds` into an LZ-compressed
   URL hash (`lz-string`). On first mount the hash wins; afterward state is mirrored
   back to it (debounced). Personal prefs (diff view, token model) are deliberately
   **not** shared.

`generateConfig()` in `page.tsx` turns `selected` into the `.prettierrc` JSON,
filtering to keys valid in the loaded version (`validKeys`) and appending any
selected plugins' npm names under `plugins`.

### Key library modules ([lib/](lib/))

- **prettierLoader.ts** — CDN loader. `PLUGIN_FILES` = built-in plugins always
  fetched; `PARSER_PLUGINS` = which plugin files each parser needs at format time.
  Third-party plugins are best-effort (`Promise.allSettled`); failures surface in
  `pluginFailures` and the UI toasts + auto-deselects them. Uses
  `new Function('u','return import(u)')` to dodge bundler static analysis of the URL.
- **parsers.ts** — `ParserId` union, `PARSERS` registry, and `detectParser()`
  content sniff (front-matter / JSON root / HTML tags / Vue blocks / GraphQL / YAML;
  defaults to `typescript`).
- **adaptSupportInfo.ts** — turns a version's `getSupportInfo()` output into the
  form's `PrettierOptionType[]` (optionally filtered by `since` version).
- **configImporter.ts** — parses a pasted config (JSON / JSON5 / JSONC /
  package.json `prettier` key / `module.exports`/`export default`) into
  `{ applied, ignored, preserved, pluginIds }`. **Never `eval`s user input** — JS
  modules are unwrapped and canonicalized through Prettier's own `json5` parser.
- **presets.ts** — one-click starter configs (`PRESETS`).
- **plugins.ts** — third-party plugin registry (id ↔ npm name ↔ CDN URL lookups).
- **tokenizers.ts** — `gpt-tokenizer` exact BPE for GPT models; `chars/N`
  approximation for Claude/Gemini/Llama/Mistral. Exact encoders lazy-`import()`ed.
- **versionDiff.ts** — `computeVersionConflicts()`: which active selections would
  vanish when switching versions (drives the warning dialog).
- **sortConfig.ts**, **timing.ts**, **utils.ts** (`cn`), **optionOverrides.ts**, **sample.ts**.

### Directory map

```
app/[locale]/        Locale-aware App Router routes (page, about, faq, layout)
  (components)/       Header, Footer
components/           Feature components (CodeEditor, CodeDiff, *Dialog, *Picker, Prettier*)
  ui/                 shadcn/ui primitives — generated, avoid hand-editing
  panel/              PanelParts
hooks/                React hooks (see above + useDiffSettings, useTokenCount, use-mobile…)
lib/                  Core non-React logic (see above)
common/
  constants/          PROJECT, repository, developer, socialMedia, languages (barrel: index.ts)
  enum/               locale.ts, prettierOption.ts
  interface/          PrettierOptionType.ts, panel.ts
  messages/           next-intl JSON, one file per locale (en.json is source of truth)
i18n/                 next-intl request.ts + navigation.ts
next-intl.config.ts   routing: locales list + defaultLocale
proxy.ts              next-intl middleware (matcher excludes api/_next/static)
Dockerfile            Bun builds → Node serves (Railway image)
railway.toml          Railway build/deploy config
```

## Deployment (Railway)

**Railway is the only deployment target.** One service, deploying from `main` via
Railway's GitHub integration. Do not add config for any other platform.

- **[railway.toml](railway.toml)** — `builder = "DOCKERFILE"`,
  `startCommand = "node server.js"`, `restartPolicyType = "ON_FAILURE"`. Service
  **Root Directory** stays `/` in the dashboard; everything else lives in this file.
- **[Dockerfile](Dockerfile)** — three stages: Bun installs → Bun builds → **Node
  serves**. The runner is `node:26-slim`, not Bun: the Next standalone server leaks
  RSS under Bun's Node-compat HTTP layer (oven-sh/bun#27514). Keep the split unless
  that's fixed upstream. The build stage still needs a `node` binary because
  `next build` spawns Node workers — it `COPY --from=node:26-slim`s that binary in
  rather than `apt-get install nodejs`, which on Debian trixie is Node 20. The copy
  relies on the Bun base and `node:26-slim` both being trixie, plus `libatomic1`;
  bump the two Debian releases together. Node stays on 26 in both stages.
- `output: 'standalone'` emits `server.js` + traced `node_modules` only — it does
  **not** copy `.next/static` or `public/`, so the runner stage copies both by hand.
  Drop either and every asset 404s.
- **No env vars are required.** Everything is client-side and CDN-loaded, so there
  is no secret to configure. Railway injects `PORT`; `server.js` reads it at
  startup — never pin `PORT` in the image.

## Conventions

- **Formatting is enforced.** [.prettierrc](.prettierrc): **tabs**, width 2,
  printWidth 100, single quotes, semicolons, `trailingComma: all`,
  `singleAttributePerLine: true`, `prettier-plugin-tailwindcss`. Run `bun run lint`
  before finishing.
- **ESLint** ([eslint.config.mjs](eslint.config.mjs)): `no-explicit-any` is an
  **error**, unused vars error (prefix `_` to ignore), `no-console` warns (only
  `warn`/`error` allowed). `prettier/prettier` is an error.
- **Imports** use the `@/*` alias (maps to repo root).
- **i18n**: every user-facing string goes through `useTranslations`. Add new keys
  to **all** `common/messages/*.json` files; `en.json` is the reference. The 20
  locales are listed in `next-intl.config.ts` (note `ar`/`fa` are RTL).
- **Client-only by default** here — the playground is interactive; most components
  carry `'use client'`.

## Gotchas

- **Never bundle Prettier.** It is loaded from CDN at runtime. Don't add `prettier`
  as a runtime import for formatting user code — go through `loadPrettier()`.
  (`prettier` _is_ a devDependency, only for formatting this repo's own source.)
- Adding a **parser**: update `ParserId` + `PARSERS` + `detectParser` in
  `lib/parsers.ts` **and** `PARSER_PLUGINS` in `lib/prettierLoader.ts`, then add a
  Preview sample and the `parserPicker` i18n labels.
- Adding a **third-party plugin**: register it in `lib/plugins.ts` (id, npm, CDN
  URL). The loader passes it to `getSupportInfo` so its options auto-appear.
- The options form is **auto-generated** from each version's `getSupportInfo()` —
  new Prettier options appear without code changes.
- `/:locale/config` permanently redirects to `/:locale` (see `next.config.ts`).
- `.env` only sets `PORT=2000`, and only for local dev — `.dockerignore` keeps it
  out of the image so it can never shadow the `PORT` Railway injects.
