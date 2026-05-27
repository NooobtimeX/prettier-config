/**
 * Built-in sample code, deliberately mis-formatted to exercise as many Prettier
 * options as possible in the preview pane. Each block is here to make a specific
 * option's effect visible:
 *
 *  - `arrowParens`         — sole arrow param (`name`) without parens.
 *  - `singleQuote`         — mix of double and single quotes.
 *  - `jsxSingleQuote`      — string attrs in JSX use double quotes.
 *  - `semi`                — semicolons omitted everywhere.
 *  - `trailingComma`       — no trailing commas in objects, arrays, params.
 *  - `bracketSpacing`      — `{name:name}` instead of `{ name: name }`.
 *  - `quoteProps`          — mix of bare and quoted object keys.
 *  - `printWidth`          — a very long string + signature triggers wrapping.
 *  - `objectWrap`          — multi-line object literal exceeds print width.
 *  - `bracketSameLine`     — JSX closing `>` on a new line vs. same line.
 *  - `singleAttributePerLine` — JSX element with multiple attributes.
 *  - `experimentalTernaries` — nested ternary expression.
 *  - `experimentalOperatorPosition` — long binary expression spanning lines.
 *  - `useTabs` / `tabWidth` — indentation is intentionally inconsistent.
 */
export const DEFAULT_SAMPLE = `import {useState,useEffect} from 'react'

const greeting=(name,age,city='Bangkok')=>{
const person={name:name,age:age,city,active:true,'data-id':123,createdAt:new Date()}
const tags=['js','ts','react','vue','prettier','babel','eslint']
const longMessage="This is a fairly long string that definitely exceeds the default print width of eighty characters so wrapping behavior is visible"
const status=person.age>=21?'adult':person.age>=18?'young-adult':person.age>=13?'teen':'child'
const total=tags.length*2+person.age-(city==='Bangkok'?100:0)+(person.active?10:-10)
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
