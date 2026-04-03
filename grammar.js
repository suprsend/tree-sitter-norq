/// <reference types="tree-sitter-cli/dsl" />

// Norq tree-sitter grammar.
// Strategy: be permissive with Markdown (treat as text), be precise with
// Norq-specific syntax (expressions, directives, frontmatter).

module.exports = grammar({
  name: "norq",

  extras: (_) => [],

  rules: {
    document: ($) => repeat($._line),

    _line: ($) =>
      choice(
        $.frontmatter_delimiter,
        $.directive_if_line,
        $.directive_each_line,
        $.directive_else_line,
        $.directive_end_line,
        $.directive_named_line,
        $.heading_line,
        $.blockquote_line,
        $.list_line,
        $.horizontal_rule,
        $.code_fence,
        $.blank_line,
        $.content_line
      ),

    // ---------------------------------------------------------------
    // Frontmatter delimiters
    // ---------------------------------------------------------------
    frontmatter_delimiter: (_) => /---[ \t]*\n/,

    // ---------------------------------------------------------------
    // Directives
    // ---------------------------------------------------------------
    directive_if_line: ($) =>
      seq(
        alias(/:::/, $.directive_marker),
        /[ \t]+/,
        alias("if", $.keyword_if),
        /[ \t]+/,
        $.condition_expr,
        /\n/
      ),

    directive_each_line: ($) =>
      seq(
        alias(/:::/, $.directive_marker),
        /[ \t]+/,
        alias("each", $.keyword_each),
        /[ \t]+/,
        field("collection", $.path),
        optional(seq(
          /[ \t]+/,
          alias("as", $.keyword_as),
          /[ \t]+/,
          field("binding", $.identifier)
        )),
        /\n/
      ),

    directive_else_line: (_) => /:::else[ \t]*\n/,
    directive_end_line: (_) => /:::[ \t]*\n/,

    directive_named_line: ($) =>
      seq(
        alias(/:::/, $.directive_marker),
        /[ \t]+/,
        field("name", $.directive_name),
        optional(seq(/[ \t]+/, field("params", $.directive_params))),
        /\n/
      ),

    directive_name: (_) =>
      token(choice(
        "header", "footer", "action", "callout", "highlight",
        "hero", "fields", "fieldset", "centered", "columns", "raw"
      )),

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
    // Markdown block-level
    // ---------------------------------------------------------------
    heading_line: ($) =>
      seq(
        $.heading_marker,
        /[ \t]+/,
        repeat(choice($.expression, $.raw_expression, $.heading_text)),
        /\n/
      ),

    heading_marker: (_) => /#{1,6}/,
    heading_text: (_) => /[^\n{]+/,

    blockquote_line: ($) =>
      seq(
        alias(">", $.blockquote_marker),
        /[ \t]*/,
        repeat(choice($.expression, $.raw_expression, /[^\n{]+/)),
        /\n/
      ),

    list_line: ($) =>
      seq(
        /[ \t]*/,
        $.list_marker,
        /[ \t]+/,
        repeat(choice($.expression, $.raw_expression, /[^\n{]+/)),
        /\n/
      ),

    list_marker: (_) => token(choice(/[*+-]/, /\d+\./)),

    horizontal_rule: (_) => /(-{3,}|\*{3,}|_{3,})[ \t]*\n/,
    code_fence: (_) => /```[^\n]*\n/,
    blank_line: (_) => /[ \t]*\n/,

    // ---------------------------------------------------------------
    // Content line (paragraphs, anything else)
    // ---------------------------------------------------------------
    content_line: ($) =>
      seq(
        repeat1(choice(
          $.expression,
          $.raw_expression,
          $.bold,
          $.italic_underscore,
          $.strikethrough,
          $.code_span,
          $.link_with_attrs,
          $.image_with_attrs,
          $.link,
          $.image,
          $.emoji,
          $.text_segment
        )),
        /\n/
      ),

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
    // Inline elements
    // ---------------------------------------------------------------
    bold: ($) =>
      seq(
        alias("**", $.emphasis_marker),
        repeat1(choice($.expression, $.raw_expression, $.bold_text)),
        alias("**", $.emphasis_marker)
      ),

    bold_text: (_) => /[^*{\n]+/,

    italic_underscore: ($) =>
      seq(
        alias("_", $.emphasis_marker),
        repeat1(choice($.expression, $.raw_expression, $.italic_text)),
        alias("_", $.emphasis_marker)
      ),

    italic_text: (_) => /[^_{\n]+/,

    strikethrough: ($) =>
      seq(
        alias("~~", $.emphasis_marker),
        repeat1(choice($.expression, $.raw_expression, $.strikethrough_text)),
        alias("~~", $.emphasis_marker)
      ),

    strikethrough_text: (_) => /[^~{\n]+/,

    code_span: (_) => /`[^`\n]+`/,

    link_with_attrs: ($) =>
      prec(2, seq(
        "[", $.link_text_content, "]",
        "(", $.link_url_content, ")",
        "{", $.attr_content, "}"
      )),

    image_with_attrs: ($) =>
      prec(2, seq(
        "!", "[", $.link_text_content, "]",
        "(", $.link_url_content, ")",
        "{", $.attr_content, "}"
      )),

    link: ($) =>
      prec(1, seq(
        "[", $.link_text_content, "]",
        "(", $.link_url_content, ")"
      )),

    image: ($) =>
      prec(1, seq(
        "!", "[", $.link_text_content, "]",
        "(", $.link_url_content, ")"
      )),

    link_text_content: ($) =>
      repeat1(choice($.expression, /[^\]{\n]+/)),

    link_url_content: ($) =>
      repeat1(choice($.expression, /[^){\n]+/)),

    attr_content: (_) => /[^}\n]+/,

    emoji: (_) => /:[a-zA-Z0-9_+-]+:/,

    text_segment: (_) => /[^\n*_~`\[!:{]+|[*_~`\[!:{]/,

    // ---------------------------------------------------------------
    // Shared
    // ---------------------------------------------------------------
    path: (_) => /[a-zA-Z_][a-zA-Z0-9_.\[\]]*/,
    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_-]*/,
  },
});
