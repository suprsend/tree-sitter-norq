# tree-sitter-norq

Tree-sitter grammar for [Norq](https://github.com/suprsend/norq) notification templates.

## What it parses

Norq templates are Markdown files with extensions for multi-channel notifications. This grammar handles:

- **Frontmatter** — YAML metadata between `---` delimiters
- **Expressions** — `{{variable | pipe "arg"}}`, `{{{raw}}}`, `{{> partial}}`
- **Directives** — `:::if`, `:::each`, `:::header`, `:::footer`, `:::action`, `:::callout`, `:::highlight`, `:::hero`, `:::fields`, `:::centered`, `:::columns`, `:::raw`
- **Conditions** — `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`
- **40 built-in pipes** — `capitalize`, `currency`, `date`, `default`, `truncate`, etc.
- **Markdown** — headings, bold, italic, strikethrough, links, images, code, lists, blockquotes, emoji
- **Inline attributes** — `{button.primary}`, `{width="100"}`

## Editor support

| Editor | How to use |
|--------|-----------|
| **Zed** | Install the [norq extension](https://github.com/suprsend/norq/tree/main/zed) |
| **Neovim** | Add to nvim-treesitter custom parsers |
| **Helix** | Add to `languages.toml` |
| **Emacs** | Via `treesit` (Emacs 29+) |

## Development

```bash
# Install tree-sitter CLI
npm install -g tree-sitter-cli

# Generate parser from grammar
tree-sitter generate

# Parse a template
tree-sitter parse path/to/email.md

# Test highlighting
tree-sitter highlight path/to/email.md
```

## Grammar structure

```
tree-sitter-norq/
  grammar.js              # Grammar definition
  queries/highlights.scm  # Syntax highlighting queries
  src/parser.c            # Generated C parser (ABI 14)
  tree-sitter.json        # Tree-sitter config
```

## License

MIT
