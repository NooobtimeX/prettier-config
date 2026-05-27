/**
 * Built-in sample code that exercises the most visually impactful Prettier options:
 * singleQuote, semi, trailingComma, bracketSpacing, arrowParens, printWidth, tabWidth, useTabs.
 */
export const DEFAULT_SAMPLE = `const greeting = (name,age) => {
const person = {name:name,age:age,city:'Bangkok',active:true}
const tags = ['js','ts','react','vue','prettier']
if(person.age>18){
return "Hello "+name+"! You have "+tags.length+" tags."
}
return null
}

export const add = (a,b) => a+b
export const multiply = (a,b,c) => a*b*c
`;
