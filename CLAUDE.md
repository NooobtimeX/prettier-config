# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**prettier-config.nooobtimex.me** — a browser-based Prettier playground / config builder. A
better-than-official Prettier playground: pick a Prettier version + options
visually, paste your code, see a GitHub-style diff, and copy/share the resulting
`.prettierrc`. Everything runs **client-side** — no backend, nothing is sent to a
server. Live at https://prettier-config.nooobtimex.me.

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

bun run gen:options   # regenerate lib/generated/prettierOptions.ts
bun run gen:articles  # regenerate lib/generated/articleRegistry.ts (scans content/)
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
- **seo.ts** — `buildPageMetadata`, canonical + hreflang, shared og:image.
- **optionRoutes.ts** — slug mapping for `/options/[option]`, related options,
  and the playground deep link (mirrors `useShareableUrl`'s LZ payload).
- **optionArticle.ts** — resolves `(locale, optionKey)` to that locale's article,
  else the English one, reporting which happened via `isFallback`. Also exports
  the synchronous `hasOptionArticle()` coverage check that `app/sitemap.ts` uses.
- **generated/articleRegistry.ts** — build-time scan of `content/options/`.
  Exports `ARTICLE_COVERAGE` (plain data: which locales have which articles) and
  `ARTICLES` (locale → key → lazy `import()`, every specifier a string literal).
  Regenerate with `bun run gen:articles`; chained into `build`.
- **generated/prettierOptions.ts** — build-time snapshot of `getSupportInfo()`
  plus real formatted examples. Regenerate with `bun run gen:options` (chained
  into `build`). Bumping the `prettier` dependency is the whole maintenance step.
- **sortConfig.ts**, **timing.ts**, **utils.ts** (`cn`), **optionOverrides.ts**, **sample.ts**.

### The option articles

Each of the 26 routed Prettier options has an original ~900-word article at
`content/options/<locale>/<optionKey>.ts`, rendered on `/[locale]/options/[option]`
by [components/ArticleBody.tsx](components/ArticleBody.tsx).

They exist because the site was hit with an AdSense **"Low value content"**
violation in September 2026. 520 of 600 sitemap URLs were per-option pages whose
only prose was one sentence copied from prettier.io — 17 words of unique content
per page, none of it ours. Google Search had independently indexed 9 of those
600 URLs, marking 579 "Discovered — currently not indexed".

Two invariants keep that from coming back:

1. **Article prose never goes in `common/messages/*.json`.** `i18n/request.ts`
   imports each locale's messages whole, and `NextIntlClientProvider` serialises
   them into all 622 prerendered pages — so anything added there is paid for 622
   times. Articles live in their own tree, outside next-intl.
2. **`ArticleBody` and everything under it stay Server Components.** Passing
   article data to a client component as a non-`children` prop would move ~6 KB
   of prose per page into a JS chunk. Assert it: after a build, no phrase from an
   article may appear anywhere in `.next/static/`.

**Per-locale gating.** A locale with no article for an option serves the English
one and the page then emits `noindex, follow` and drops out of both the sitemap
and the hreflang cluster — all three driven by `ARTICLE_COVERAGE`, so they cannot
drift apart. The page still works for readers; it just stops competing as a
near-duplicate. Translating a locale is therefore additive: add
`content/options/<locale>/*.ts`, and those URLs re-enter the index on the next
build with no second list to update.

### Ads (Google AdSense)

Client-side only, like everything else here.

- **[common/constants/adsense.ts](common/constants/adsense.ts)** — `ADSENSE.CLIENT_ID`
  plus `AD_SLOTS`, the registry of `data-ad-slot` IDs. A `null` slot renders
  nothing, so placements can be committed before the unit exists in the AdSense
  dashboard. The publisher ID is public, so it is a constant, not an env var —
  the "no env vars required" deploy story stays true.
- **[components/AdSenseScript.tsx](components/AdSenseScript.tsx)** — the
  `adsbygoogle.js` loader, `afterInteractive`, rendered from the root layout.
  Required for Auto ads _and_ manual units. Returns `null` outside production.
- **[components/AdSlot.tsx](components/AdSlot.tsx)** — one `<ins class="adsbygoogle">`.
  Guards against Strict Mode double-push (`data-adsbygoogle-status`) and defers
  the push through a `ResizeObserver` until the container has non-zero width,
  because AdSense bails permanently on `availableWidth=0`.
- **[public/ads.txt](public/ads.txt)** — authorized-sellers file.

### Directory map

```
app/[locale]/        Locale-aware App Router routes
  page.tsx            server shell: metadata + JSON-LD + h1
  (components)/       Header, Footer, Playground (client), OptionReference (server)
  options/            /options hub + /options/[option] per-option pages
  about, faq, privacy
  (components)/       Header, Footer
components/           Feature components (CodeEditor, CodeDiff, *Dialog, *Picker, Prettier*)
  ui/                 shadcn/ui primitives — generated, avoid hand-editing
  panel/              PanelParts
hooks/                React hooks (see above + useDiffSettings, useTokenCount, use-mobile…)
content/options/      Long-form option articles, one dir per locale
  en/<optionKey>.ts     ~900 words each; the site's own prose, not Prettier's
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

- **The site moved to `prettier-config.nooobtimex.me`** (2026-09-04).
  `prettier-config.dev` is still owned and 301-redirects to it via a Cloudflare
  Redirect Rule on that zone — no origin hit, no app code. `SITE_URL`
  (`lib/seo.ts`) is the single source: `app/robots.ts` and
  `app/[locale]/layout.tsx` now derive from it rather than repeating the literal,
  which is how they drifted last time.
- **`ads.txt` no longer works from this repo.** For a subdomain, crawlers read
  `ads.txt` from the **root** domain only, so `nooobtimex.me/ads.txt` is the file
  that counts and it lives in the portfolio service, not here. `public/ads.txt`
  is now inert — keep it for the .dev domain until that redirect is retired.

- **Never bundle Prettier _for runtime formatting_.** User code is formatted by
  the CDN-loaded copy — go through `loadPrettier()`. Note `prettier` is a regular
  **dependency** (not a devDependency, as this file used to claim), which is what
  lets `scripts/generate-prettier-options.mjs` resolve it at build time. Build-time
  codegen is fine: it calls `getSupportInfo()` and formats sample snippets, emits
  plain data, and no `prettier` import survives into either bundle. Assert it —
  after a build `.next/standalone/node_modules/prettier` must not exist and no
  client chunk may contain `STATIC_PRETTIER_OPTIONS`.
- Adding a **parser**: update `ParserId` + `PARSERS` + `detectParser` in
  `lib/parsers.ts` **and** `PARSER_PLUGINS` in `lib/prettierLoader.ts`, then add a
  Preview sample and the `parserPicker` i18n labels.
- Adding a **third-party plugin**: register it in `lib/plugins.ts` (id, npm, CDN
  URL). The loader passes it to `getSupportInfo` so its options auto-appear.
- The options form is **auto-generated** from each version's `getSupportInfo()` —
  new Prettier options appear without code changes.
- `/:locale/config` permanently redirects to `/:locale` (see `next.config.ts`).
- **Never add `public/robots.txt`.** Next resolves `public/` before app routes, so
  it silently shadows `app/robots.ts` and drops the `Sitemap:` directive.
- **Page metadata must go through `buildPageMetadata()`** in [lib/seo.ts](lib/seo.ts).
  Next _replaces_ rather than merges `robots`/`openGraph`/`twitter`, so a route
  that sets any of them by hand silently loses the layout's `googleBot`
  directives and `og:image`. The layout deliberately declares **no** `alternates`
  — a route that forgets its canonical should emit none rather than inherit a
  wrong one.
- **`dynamicParams = false`** on `app/[locale]/layout.tsx` is load-bearing.
  `proxy.ts`'s matcher skips dotted paths and `i18n/request.ts` falls back to
  `defaultLocale`, so without it `/anything.foo` renders the home page with
  HTTP 200 and `<html lang="anything.foo">`.
- The home route is a **server shell**: `app/[locale]/page.tsx` owns
  `generateMetadata`, the JSON-LD and the `<h1>`; the interactive tree lives in
  `app/[locale]/(components)/Playground.tsx`. Keep it that way — making page.tsx
  a client component again would take the per-locale canonical with it.
- The AdSense publisher ID is spelled **two different ways**: `ca-pub-…` in the
  `<meta google-adsense-account>` tag, the loader's `?client=`, and every
  `data-ad-client`; bare `pub-…` (no `ca-`) in `public/ads.txt`. Getting the
  ads.txt one wrong fails silently as "Earnings at risk" in the dashboard.
- `/ads.txt` is reachable only because `proxy.ts`'s matcher skips any path
  containing a dot. Loosening that regex would send it through the next-intl
  middleware, redirect it to `/en/ads.txt`, and break Google's crawler.
- The home page is `h-screen` with `overflow-hidden` panels and fixed FABs at
  `bottom-4 right-4`. AdSense **anchor and vignette Auto ads** overlay that UI —
  keep them off in the dashboard; in-content units only.
- `.env` only sets `PORT=2000`, and only for local dev — `.dockerignore` keeps it
  out of the image so it can never shadow the `PORT` Railway injects.
