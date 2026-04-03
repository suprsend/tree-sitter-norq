; Frontmatter
(frontmatter_delimiter) @punctuation.special

; Directives
(directive_if_prefix) @keyword
(directive_each_prefix) @keyword
(directive_else_line) @keyword
(directive_end_line) @punctuation.special
(directive_name_token) @tag
(directive_params) @string.special
(keyword_as) @keyword

; Conditions
(comparison_operator) @operator
(logical_operator) @operator
(negation_operator) @operator
(string_literal) @string
(number_literal) @number
(boolean_literal) @constant.builtin

; Expressions
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

; Headings
(heading_marker) @punctuation.special
(heading_text) @markup.heading

; Code / rules
(code_fence) @string.special
(horizontal_rule) @punctuation.special
