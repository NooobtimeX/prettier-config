---
name: prettier-playground-dev
description: Extend or modify the prettier-config.dev playground — add a Prettier parser, third-party plugin, preset, supported language, locale, or token-counter model; wire CDN-loaded Prettier; or touch the version/options/share/diff flow. Use when working in this repo on any of those features.
---

# Prettier Playground Dev

This skill encodes the repeatable extension workflows for **prettier-config.dev**,
a fully client-side Prettier playground. Read [AGENTS.md](../../../AGENTS.md) for
the full architecture; this file is the step-by-step for common changes.

## Ground rules

- **Prettier is CDN-loaded at runtime** from jsDelivr per version — never bundle it
  or `import 'prettier'` to format user code. All formatting goes through
  `loadPrettier()` in [lib/prettierLoader.ts](../../../lib/prettierLoader.ts).
- **No tests.** Verify with `bun dev` (port 2000) and the real UI.
- **Format before finishing:** `bun run lint` (eslint --fix && prettier --write .).
  Tabs, single quotes, printWidth 100, `no-explicit-any` is an error.
- **i18n is mandatory** for user-facing strings: add keys to every
  `common/messages/*.json` (20 locales), with `en.json` as the source of truth.

## Recipe: add a parser (new language in "Your Code")

1. `lib/parsers.ts` — add the id to the `ParserId` union, add an entry to `PARSERS`
   (with extensions), and extend `detectParser()` if it can be auto-sniffed (put
   cheap/specific checks first; `typescript` is the fallback).
2. `lib/prettierLoader.ts` — add the parser → plugin-file mapping in
   `PARSER_PLUGINS`. If it needs a built-in plugin not already in `PLUGIN_FILES`,
   add the `.mjs` filename there too.
3. Add a deliberately mis-formatted **Preview sample** so every relevant option has
   something to demonstrate on (see `lib/sample.ts` / the Preview tab samples).
4. Add the `Page.parserPicker.parsers.<id>` label to all `common/messages/*.json`.

## Recipe: add a third-party Prettier plugin

1. Register it in [lib/plugins.ts](../../../lib/plugins.ts): id, npm name, and the
   jsDelivr CDN URL of its browser/ESM build.
2. That's usually it — the loader passes every registered plugin to
   `getSupportInfo`, so its options auto-render in the form, and `generateConfig`
   adds its npm name to the config's `plugins` array.
3. Plugins that fail to load (Node-only deps, network) are caught by
   `Promise.allSettled` in the loader, toasted, and auto-deselected — confirm yours
   actually has a browser-safe build before adding it.

## Recipe: add a preset

Add a `{ id, options }` entry to `PRESETS` in [lib/presets.ts](../../../lib/presets.ts)
and the `Page.presets.<id>` label/description to every locale JSON. Options unknown
to the loaded version are auto-stashed (excluded from output) by `validKeys`.

## Recipe: add a locale

1. Add the code to the `locales` array in
   [next-intl.config.ts](../../../next-intl.config.ts) (mark RTL ones mentally —
   `ar`, `fa` already exist).
2. Create `common/messages/<code>.json` by copying `en.json` and translating every
   key (keys must match exactly).
3. Add it to the language list used by `LanguageSwitcher` / `common/constants/languages.ts`.

## Recipe: add a token-counter model

Edit [lib/tokenizers.ts](../../../lib/tokenizers.ts): add the id to `TokenModelId`
and an entry to `TOKEN_MODELS`. Use `approximate: false` only if you wire a real
offline tokenizer (lazy-`import()` it like the `gpt-tokenizer` encoders); otherwise
`approximate: true` uses the `chars/N` heuristic.

## Where things live

- Version switch + conflict warning: `handleVersionRequest` in
  [app/[locale]/page.tsx](../../../app/[locale]/page.tsx) +
  [lib/versionDiff.ts](../../../lib/versionDiff.ts).
- Config import/paste: [lib/configImporter.ts](../../../lib/configImporter.ts)
  (never `eval`s input — JS modules go through Prettier's own json5 parser).
- Share URL: [hooks/useShareableUrl.ts](../../../hooks/useShareableUrl.ts) (lz-string hash).
- Persistence: [hooks/usePersistedConfig.ts](../../../hooks/usePersistedConfig.ts)
  (`useSyncExternalStore`, key `prettier-config-state`).
- Options form generation: [lib/adaptSupportInfo.ts](../../../lib/adaptSupportInfo.ts).
- shadcn/ui primitives live in `components/ui/` — generated, prefer regenerating over hand-editing.

## Verify

```bash
bun dev          # exercise the changed flow in the browser at :2000
bun run lint     # must pass clean
bun run build    # for non-trivial changes, confirm the production build
```
