/// <reference types="tree-sitter-cli/dsl" />

// Norq tree-sitter grammar — v3 (safe + correct)
//
// Strategy: line-oriented. Each line is a single token or a sequence of
// tokens that starts with an unambiguous prefix. Directives use a single
// token for ":::keyword" so the lexer can resolve them without backtracking.
// Inline content only parses expressions (unambiguous `{{...}}`).
// Markdown formatting is left as text.

module.exports = grammar({
  name: "norq",

  extras: (_) => [],

  rules: {
    document: ($) => repeat($._line),

    _line: ($) =>
      choice(
        $.directive_if_line,
        $.directive_each_line,
        $.directive_else_line,
        $.directive_named_line,
        $.directive_end_line,
        $.frontmatter_delimiter,
        $.heading_line,
        $.code_fence,
        $.horizontal_rule,
        $.blank_line,
        $.content_line
      ),

    // ---------------------------------------------------------------
    // Frontmatter
    // ---------------------------------------------------------------
    frontmatter_delimiter: (_) => token(prec(5, /---[ \t]*\n/)),

    // ---------------------------------------------------------------
    // Directives — each prefix is a single high-priority token
    // ---------------------------------------------------------------
    directive_if_line: ($) =>
      seq(
        alias(token(prec(10, /:::[ \t]+if[ \t]+/)), $.directive_if_prefix),
        $.condition_expr,
        /\n/
      ),

    directive_each_line: ($) =>
      seq(
        alias(token(prec(10, /:::[ \t]+each[ \t]+/)), $.directive_each_prefix),
        field("collection", $.path),
        optional(seq(
          /[ \t]+/,
          alias("as", $.keyword_as),
          /[ \t]+/,
          field("binding", $.identifier)
        )),
        /\n/
      ),

    directive_else_line: (_) => token(prec(10, /:::else[ \t]*\n/)),

    directive_named_line: ($) =>
      seq(
        field("name", $.directive_name_token),
        optional(seq(/[ \t]+/, field("params", $.directive_params))),
        /\n/
      ),

    directive_name_token: (_) =>
      token(prec(10, choice(
        /:::[ \t]+header/,
        /:::[ \t]+footer/,
        /:::[ \t]+action/,
        /:::[ \t]+callout/,
        /:::[ \t]+highlight/,
        /:::[ \t]+hero/,
        /:::[ \t]+fields/,
        /:::[ \t]+fieldset/,
        /:::[ \t]+centered/,
        /:::[ \t]+columns/,
        /:::[ \t]+raw/
      ))),

    directive_end_line: (_) => token(prec(10, /:::[ \t]*\n/)),

    directive_params: (_) => /[^\n]+/,

    // ---------------------------------------------------------------
    // Conditions
    // ---------------------------------------------------------------
    condition_expr: ($) =>
      repeat1(choice(
        $.comparison_operator,
        $.logical_operator,
        $.negation_operator,
        $.string_literal,
        $.number_literal,
        $.boolean_literal,
        $.path,
        /[ \t]+/
      )),

    comparison_operator: (_) => token(choice("==", "!=", ">=", "<=", ">", "<")),
    logical_operator: (_) => token(choice("&&", "||")),
    negation_operator: (_) => "!",

    string_literal: (_) => /"[^"]*"/,
    number_literal: (_) => /\d+(\.\d+)?/,
    boolean_literal: (_) => token(choice("true", "false")),

    // ---------------------------------------------------------------
    // Block-level Markdown
    // ---------------------------------------------------------------
    heading_line: ($) =>
      seq(
        $.heading_marker,
        /[ \t]+/,
        repeat(choice($.expression, $.raw_expression, $.heading_text)),
        /\n/
      ),

    heading_marker: (_) => token(prec(5, /#{1,6}/)),
    heading_text: (_) => /[^\n{]+/,

    code_fence: (_) => token(prec(5, /```[^\n]*\n/)),
    horizontal_rule: (_) => token(prec(5, /(-{3,}|\*{3,}|_{3,})[ \t]*\n/)),
    blank_line: (_) => /[ \t]*\n/,

    // ---------------------------------------------------------------
    // Content line — expressions + text
    // ---------------------------------------------------------------
    content_line: ($) =>
      seq(
        repeat1(choice(
          $.expression,
          $.raw_expression,
          $.text_chunk
        )),
        /\n/
      ),

    // Greedily consume non-expression, non-newline text.
    // Lone `{` is included as text (only `{{` starts an expression).
    text_chunk: (_) => /([^\n{]|\{[^\n{])+/,

    // ---------------------------------------------------------------
    // Expressions
    // ---------------------------------------------------------------
    expression: ($) =>
      seq(
        alias("{{", $.expression_open),
        choice($.partial_ref, $.expression_body),
        alias("}}", $.expression_close)
      ),

    raw_expression: ($) =>
      seq(
        alias("{{{", $.raw_expression_open),
        $.path,
        alias("}}}", $.raw_expression_close)
      ),

    partial_ref: ($) =>
      seq(
        alias(">", $.partial_operator),
        /[ \t]*/,
        field("name", $.identifier)
      ),

    expression_body: ($) =>
      seq($.path, repeat($.pipe_call)),

    pipe_call: ($) =>
      seq(
        /[ \t]*/,
        alias("|", $.pipe_operator),
        /[ \t]*/,
        field("name", $.pipe_name),
        repeat(field("arg", $._pipe_arg))
      ),

    pipe_name: (_) =>
      token(choice(
        "capitalize", "uppercase", "lowercase", "titlecase",
        "truncate", "trim", "trim_start", "trim_end",
        "replace", "append", "prepend", "default",
        "pluralize", "md5", "split",
        "count", "join", "unique", "at", "first", "last",
        "reverse", "sort", "slice",
        "add", "subtract", "multiply", "divide", "round",
        "mod", "abs", "ceil", "floor",
        "percent", "number", "currency",
        "json", "from_json",
        "date", "timezone"
      )),

    _pipe_arg: ($) =>
      seq(/[ \t]+/, choice($.string_literal, $.number_literal, $.path)),

    // ---------------------------------------------------------------
    // Shared
    // ---------------------------------------------------------------
    path: (_) => /[a-zA-Z_][a-zA-Z0-9_.\[\]]*/,
    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_-]*/,
  },
});
