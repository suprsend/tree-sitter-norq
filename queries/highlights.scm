; ---------------------------------------------------------------
; Frontmatter
; ---------------------------------------------------------------
(frontmatter_delimiter) @punctuation.special

; ---------------------------------------------------------------
; Directives
; ---------------------------------------------------------------
(directive_marker) @punctuation.special
(directive_name) @tag
(directive_params) @string.special
(directive_else_line) @keyword
(directive_end_line) @punctuation.special

; Keywords
(keyword_if) @keyword
(keyword_each) @keyword
(keyword_as) @keyword

; ---------------------------------------------------------------
; Conditions
; ---------------------------------------------------------------
(comparison_operator) @operator
(logical_operator) @operator
(negation_operator) @operator

(string_literal) @string
(number_literal) @number
(boolean_literal) @constant.builtin

; ---------------------------------------------------------------
; Expressions
; ---------------------------------------------------------------
(expression_open) @punctuation.special
(expression_close) @punctuation.special
(raw_expression_open) @punctuation.special
(raw_expression_close) @punctuation.special

(path) @variable
(pipe_operator) @operator
(pipe_name) @function.builtin

; Partials
(partial_operator) @operator
(partial_ref name: (identifier) @function)

; ---------------------------------------------------------------
; Markdown — Headings
; ---------------------------------------------------------------
(heading_marker) @punctuation.special
(heading_text) @markup.heading

; ---------------------------------------------------------------
; Markdown — Emphasis
; ---------------------------------------------------------------
(emphasis_marker) @punctuation.delimiter
(bold (bold_text) @markup.bold)
(italic_underscore (italic_text) @markup.italic)
(strikethrough (strikethrough_text) @markup.strikethrough)

; ---------------------------------------------------------------
; Markdown — Code
; ---------------------------------------------------------------
(code_fence) @string.special
(code_span) @markup.raw

; ---------------------------------------------------------------
; Markdown — Links & Images
; ---------------------------------------------------------------
(link (link_text_content) @markup.link)
(link (link_url_content) @markup.underline)
(link_with_attrs (link_text_content) @markup.link)
(link_with_attrs (link_url_content) @markup.underline)
(link_with_attrs (attr_content) @attribute)

(image (link_text_content) @string)
(image (link_url_content) @markup.underline)
(image_with_attrs (link_text_content) @string)
(image_with_attrs (link_url_content) @markup.underline)
(image_with_attrs (attr_content) @attribute)

; ---------------------------------------------------------------
; Markdown — Other
; ---------------------------------------------------------------
(blockquote_marker) @punctuation.special
(list_marker) @punctuation.special
(horizontal_rule) @punctuation.special
(emoji) @string.special
