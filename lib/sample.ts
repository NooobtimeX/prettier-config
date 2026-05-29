/**
 * Per-parser samples shown in the Preview tab, deliberately mis-formatted to
 * exercise as many of that parser's Prettier options as possible. The user
 * picks which sample to view via the parser dropdown next to the diff toggle.
 *
 * Coverage matrix (rough — options without a visible effect in a static sample
 * are noted but not always exercised):
 *
 *  typescript / babel / flow  arrowParens, singleQuote, jsxSingleQuote, semi,
 *                             trailingComma, bracketSpacing, quoteProps,
 *                             printWidth, objectWrap, bracketSameLine,
 *                             singleAttributePerLine, experimentalTernaries,
 *                             experimentalOperatorPosition, useTabs/tabWidth.
 *  css / scss / less          singleQuote (url()), printWidth, tabWidth/useTabs.
 *  html / vue / angular       htmlWhitespaceSensitivity, bracketSameLine,
 *                             singleAttributePerLine, vueIndentScriptAndStyle.
 *  json / json5 / jsonc       printWidth, tabWidth, objectWrap, trailingComma
 *                             (json5/jsonc), quoted keys.
 *  markdown / mdx             proseWrap, printWidth, embeddedLanguageFormatting
 *                             (fenced JS block), singleQuote (in fences).
 *  yaml                       printWidth, tabWidth, proseWrap.
 *  graphql                    printWidth, tabWidth, bracketSpacing.
 */

import type { ParserId } from './parsers';

const TYPESCRIPT_SAMPLE = `import {useState,useEffect} from 'react'

interface Person {name:string;age:number;city?:string;'data-id':number}

const greeting=(name,age,city='Bangkok')=>{
const person:Person={name:name,age:age,city,active:true,'data-id':123,createdAt:new Date()}
const tags=['js','ts','react','vue','prettier','babel','eslint']
const longMessage="This is a fairly long string that definitely exceeds the default print width of eighty characters so wrapping behavior is visible"
const status=person.age>=21?'adult':person.age>=18?'young-adult':person.age>=13?'teen':'child'
const total=tags.length*2+person.age-(city==='Bangkok'?100:0)+(person.active?10:-10)
const initial=person?.city?.toUpperCase?.()??'UNKNOWN'
if(person.age>18){
return \`Hello \${name}! You have \${tags.length} tags and status: \${status}\`
}
return null
}

const Button=({children,variant='primary',size='md',onClick,disabled=false,...rest})=>(
<button type="button" className={\`btn btn-\${variant} btn-\${size}\`} onClick={onClick} disabled={disabled} aria-label="primary action" {...rest}>
{children}
</button>
)

export const add=(a,b)=>a+b
export const multiply=(a,b,c)=>a*b*c
export async function fetchUser(id){
const res=await fetch(\`/api/users/\${id}\`,{headers:{'Content-Type':'application/json','X-Request-Id':'abc-123'}})
if(!res.ok)throw new Error(\`Request failed: \${res.status}\`)
return res.json()
}
`;

const CSS_SAMPLE = `.btn,.button{display:inline-flex;align-items:center;justify-content:center;padding:8px 16px;background:#FFFFFF;color:#1A1A1A;border:1px solid #DDDDDD;border-radius:4px;font-family:"Inter",ui-sans-serif,system-ui;background-image:url("https://example.com/some-very-long-asset-name-that-exceeds-print-width.svg")}
.btn:hover,.btn:focus-visible{background:#F5F5F5;color:#000;box-shadow:0 1px 2px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.06);transition:background 200ms ease,box-shadow 200ms ease}
.card{margin:0;padding:24px;background:#fff;-webkit-box-shadow:0 2px 4px rgba(0,0,0,0.1);box-shadow:0 2px 4px rgba(0,0,0,0.1)}
@media (min-width:768px) and (max-width:1023px){.btn{padding:12px 20px;font-size:1rem}.card{padding:32px}}
`;

const SCSS_SAMPLE = `$primary:#3366FF;$radius:4px;$spacing:(small:4px,medium:8px,large:16px);
.btn{display:inline-flex;padding:map-get($spacing,medium) map-get($spacing,large);background:$primary;color:white;border-radius:$radius;
&:hover{background:darken($primary,10%);box-shadow:0 2px 4px rgba(0,0,0,0.1)}
&--secondary{background:transparent;color:$primary;border:1px solid $primary}}
@mixin flex-center{display:flex;align-items:center;justify-content:center}
.card{@include flex-center;padding:map-get($spacing,large);background:url("https://example.com/some-very-long-asset-name-that-exceeds-the-default-print-width.svg") no-repeat center}
`;

const LESS_SAMPLE = `@primary:#3366FF;@radius:4px;@padding:16px;
.btn{display:inline-flex;padding:@padding/2 @padding;background:@primary;color:white;border-radius:@radius;
&:hover{background:darken(@primary,10%);box-shadow:0 2px 4px rgba(0,0,0,.1)}
&.btn-secondary{background:transparent;color:@primary;border:1px solid @primary}}
.mixin(@x;@y:#000){box-shadow:@x @y;}
.card{.mixin(2px 4px;rgba(0,0,0,.2));padding:@padding;background:url("https://example.com/some-very-long-asset-name-that-exceeds-the-default-print-width.svg")}
`;

const HTML_SAMPLE = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Prettier HTML Sample</title></head>
<body class="layout">
<header class="site-header" data-region="primary" data-testid="header" aria-label="Primary navigation" role="banner">
<a href="/" class="logo">Prettier Config</a>
<nav><ul><li><a href="/about">About</a></li><li><a href="/faq">FAQ</a></li></ul></nav>
</header>
<main>
<h1>This is a heading that demonstrates how Prettier handles a fairly long inline title containing a   stretch of   internal whitespace.</h1>
<p>A paragraph with  preserved  whitespace between <strong>inline</strong> tags and <em>emphasis</em> that prettier may rewrap.</p>
<pre>  preserved
    whitespace
  block</pre>
<img src="/og-image.png" alt="og" width="1200" height="630">
<input type="checkbox" name="agree" checked>
</main>
</body>
</html>
`;

const VUE_SAMPLE = `<template>
<section class="card" :class="{active:isActive,disabled:disabled}" @click="handleClick" data-testid="primary-card" aria-label="primary card">
<h2>{{title}}</h2>
<p v-if="description">{{description}}</p>
<button type="button" :disabled="disabled" @click.stop="onConfirm">Confirm</button>
</section>
</template>
<script setup lang="ts">
import {ref,computed} from 'vue'
const props=defineProps<{title:string;description?:string;disabled?:boolean}>()
const isActive=ref(false)
const emit=defineEmits<{(e:'confirm'):void}>()
function handleClick(){isActive.value=!isActive.value}
function onConfirm(){emit('confirm')}
</script>
<style scoped>
.card{padding:16px;border:1px solid #ddd;border-radius:4px;background:#fff}
.card.active{background:#f0f4ff}
.card.disabled{opacity:.6}
</style>
`;

const ANGULAR_SAMPLE = `<section class="card" [class.active]="isActive" [class.disabled]="disabled" (click)="handleClick()" data-testid="primary-card" aria-label="primary card">
<h2>{{ title }}</h2>
<p *ngIf="description">{{ description }}</p>
<button type="button" [disabled]="disabled" (click)="onConfirm($event)">Confirm</button>
<ul>
<li *ngFor="let item of items;trackBy:trackById">{{ item.name }}</li>
</ul>
</section>
`;

const JSON_SAMPLE = `{"name":"prettier-config","version":"1.0.0","private":false,"description":"A modern web tool that helps developers create and customize their .prettierrc files","keywords":["prettier","config","formatter","javascript","typescript"],"scripts":{"dev":"next dev -p 2000","build":"next build","start":"next start -p 2000","lint":"eslint --fix && prettier --write ."},"dependencies":{"next":"^16.2.6","react":"^19.2.6","react-dom":"^19.2.6"},"engines":{"node":">=20"}}
`;

const JSON5_SAMPLE = `// prettier-config — package metadata (JSON5 sample)
{
name:'prettier-config',version:"1.0.0",private:false,
description:"A modern web tool that helps developers create and customize their .prettierrc files",
keywords:['prettier','config','formatter','javascript','typescript',],
scripts:{dev:'next dev -p 2000',build:"next build",start:'next start -p 2000',lint:"eslint --fix && prettier --write .",},
dependencies:{next:'^16.2.6',react:'^19.2.6','react-dom':'^19.2.6',},
engines:{node:'>=20',},
}
`;

const JSONC_SAMPLE = `{
// tsconfig.json — TypeScript compiler options (JSONC sample)
"compilerOptions": {
"target":"ES2022","module":"esnext","moduleResolution":"bundler","jsx":"preserve","strict":true,"noEmit":true,
"esModuleInterop":true,"skipLibCheck":true,"resolveJsonModule":true,"isolatedModules":true,
/* path aliases keep imports tidy across the app/ + components/ + lib/ tree */
"baseUrl":".","paths":{"@/*":["./*"]},
"plugins":[{"name":"next"}]
},
"include":["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"],
"exclude":["node_modules"]
}
`;

const MARKDOWN_SAMPLE = `---
title: Prettier Config — Markdown sample
description: A short markdown blob that exercises proseWrap, embedded code, and tables.
---

# Why Prettier

Prettier is an opinionated code formatter that enforces a consistent style across your codebase. It removes all original styling and re-prints your code with a uniform format, eliminating style debates in code reviews.

## Quick start

1. Install: \`npm i -D prettier\`
2. Add a \`.prettierrc\` at the project root.
3. Run \`npx prettier --write .\` to format every supported file.

\`\`\`js
const greet=(name)=>{const msg='hi '+name;return msg.toUpperCase()}
greet("world")
\`\`\`

| Option | Default | Description |
| --- | --- | --- |
| printWidth | 80 | Target line length |
| tabWidth | 2 | Spaces per indentation level |
| singleQuote | false | Use single quotes in JS |

> Prettier saves time on formatting debates and keeps diffs focused on real changes. This long blockquote is here to give \`proseWrap\` something to chew on if you flip it to \`always\` versus \`never\`.
`;

const MDX_SAMPLE = `---
title: Prettier Config — MDX sample
---

import {Callout} from './Callout'

# Hello from MDX

This file mixes markdown prose with JSX components — Prettier formats both at once.

<Callout type="info" title="Heads up" dismissable={true}>
This is a long callout body that should reflow under \`proseWrap: always\` while keeping the \`<Callout>\` attributes wrapped by \`singleAttributePerLine\` if you flip it.
</Callout>

\`\`\`ts
const greet=(name:string)=>\`hi \${name}\`
\`\`\`

- bullet one
- bullet two with a [link](https://prettier.io) inside
`;

const YAML_SAMPLE = `name: prettier-config
version: 1.0.0
description: A modern web tool that helps developers create and customize their .prettierrc files in a long sentence that may wrap depending on proseWrap.
keywords: [prettier, config, formatter, javascript, typescript]
scripts:
  dev: next dev -p 2000
  build: next build
  start: next start -p 2000
  lint: 'eslint --fix && prettier --write .'
dependencies:
  next: ^16.2.6
  react: ^19.2.6
  react-dom: ^19.2.6
notes: |
  This is a multi-line literal block that preserves its
  newlines exactly as written.
summary: >
  This is a folded block that joins
  the lines with a single space when
  rendered.
defaults: &defaults
  retries: 3
  timeout: 30
production:
  <<: *defaults
  endpoint: https://prettier-config.dev
`;

const GRAPHQL_SAMPLE = `query GetUserWithPosts($id: ID!, $first: Int = 5, $orderBy: PostOrder = CREATED_AT_DESC) {
user(id: $id) {
id
name
email
avatarUrl
posts(first: $first, orderBy: $orderBy) {
edges {
node {
id
title
publishedAt
... on Article {
readingTime
tags
}
... on Note {
pinned
}
}
}
pageInfo { hasNextPage endCursor }
}
}
}

fragment PostFields on Post {
id
title
publishedAt
}

mutation CreatePost($input: PostInput!) {
createPost(input: $input) {
post { ...PostFields }
errors { field message }
}
}
`;

/**
 * One sample per parser. Closely-related parsers reuse the same body
 * (`babel`/`flow` → `typescript`; `mdx` → `markdown` until MDX-only forms
 * are worth exercising separately).
 */
export const SAMPLES: Record<ParserId, string> = {
	typescript: TYPESCRIPT_SAMPLE,
	babel: TYPESCRIPT_SAMPLE,
	flow: TYPESCRIPT_SAMPLE,
	css: CSS_SAMPLE,
	scss: SCSS_SAMPLE,
	less: LESS_SAMPLE,
	html: HTML_SAMPLE,
	vue: VUE_SAMPLE,
	angular: ANGULAR_SAMPLE,
	json: JSON_SAMPLE,
	json5: JSON5_SAMPLE,
	jsonc: JSONC_SAMPLE,
	markdown: MARKDOWN_SAMPLE,
	mdx: MDX_SAMPLE,
	yaml: YAML_SAMPLE,
	graphql: GRAPHQL_SAMPLE,
};

/**
 * Safe getter — never returns undefined even if `parser` is somehow not in
 * `SAMPLES` (defensive against a stale localStorage value after the
 * `useDiffSettings` validator drops it back to default).
 */
export function getSample(parser: ParserId): string {
	return SAMPLES[parser] ?? TYPESCRIPT_SAMPLE;
}

/** Back-compat alias for callers that haven't been migrated yet. */
export const DEFAULT_SAMPLE = TYPESCRIPT_SAMPLE;
