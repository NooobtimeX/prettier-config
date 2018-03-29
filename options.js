const options = [
    {
        name: 'Print Width',
        key: 'printWidth',
        description: 'Line length the printer will wrap on?',
        type: 'input',
        validate: 'integer'
    },
    {
        name: 'Tab Width',
        key: 'tabWidth',
        description: 'Number of spaces per indentation-level?',
        type: 'input',
        validate: 'integer'
    },
    {
        name: 'Tabs',
        key: 'useTabs',
        description: 'Indent lines with tabs? (vs spaces)',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Semicolons',
        key: 'semi',
        description: 'Print semicolons at end of every statement? (vs ASI only)',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Quotes',
        key: 'singleQuote',
        description: 'Use single quotes? (vs double)',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Trailing Commas',
        key: 'trailingComma',
        description: 'Print trailing commas when multi-line for?',
        type: 'buttons',
        options: ['none', 'es5', 'all'],
        validate: 'string'
    },
    {
        name: 'Bracket Spacing',
        key: 'bracketSpacing',
        description: 'Print spaces between brackets in object literals?',
        type: 'buttons',
        options: [true, false],
        examples: ['{ foo: bar }', '{foo: bar}'],
        validate: 'boolean'
    },
    {
        name: 'JSX Brackets',
        key: 'jsxBracketSameLine',
        description: 'Put the > of a multi-line JSX element at the end of the last line instead of being alone on the next line? (except for self closing elements)',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Arrow Function Parentheses',
        key: 'arrowParens',
        description: 'Include parentheses around a sole arrow function parameter?',
        type: 'buttons',
        options: ['avoid', 'always'],
        examples: ['x => x', '(x) => x'],
        validate: 'string'
    },
    {
        name: 'Range Start',
        key: 'rangeStart',
        description: 'Format only a segment of a file, starting at what character offset? (inclusive)',
        type: 'input',
        validate: 'integer'
    },
    {
        name: 'Range End',
        key: 'rangeEnd',
        description: 'Format only a segment of a file, ending at what character offset? (exclusive)',
        type: 'input',
        validate: 'integer'
    },
    {
        name: 'FilePath',
        key: 'filePath',
        description: 'The input filepath? (used to do parser inference.)',
        type: 'input',
        validate: 'string'
    },
    {
        name: 'Require Pragma',
        key: 'requirePragma',
        description: 'Format files only containing a special comment (pragma) at top of file?',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Insert Pragma',
        key: 'insertPragma',
        description: 'Insert a special @format marker at the top of files specifying that the file has been formatted with prettier? (see require pragma)',
        type: 'buttons',
        options: [true, false],
        validate: 'boolean'
    },
    {
        name: 'Prose Wrap',
        key: 'proseWrap',
        description: 'Wrap markdown text?',
        type: 'buttons',
        options: ['always', 'never', 'preserve'],
        validate: 'string'
    }
];

export default options;
