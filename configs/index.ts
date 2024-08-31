const MAX_NESTING_DEPTH = 10;

enum TokenType {
  EOF = "EOF",

  LINK = "LINK",
  IMAGE = "IMAGE",

  BOLD = "BOLD",
  CLASS = "CLASS",
  ITALIC = "ITALIC",
  STRIKETHROUGH = "STRIKETHROUGH",

  HEADING_1 = "HEADING_1",
  HEADING_2 = "HEADING_2",
  HEADING_3 = "HEADING_3",
  HEADING_4 = "HEADING_4",
  HEADING_5 = "HEADING_5",
  HEADING_6 = "HEADING_6",
  PARAGRAPH = "PARAGRAPH",

  LIST_ITEM = "LIST_ITEM",
  ORDERED_LIST = "ORDERED_LIST",
  UNORDERED_LIST = "UNORDERED_LIST",

  CODE_BLOCK = "CODE_BLOCK",
  BLOCKQUOTE = "BLOCKQUOTE",
  INLINE_CODE = "INLINE_CODE",

  TABLE = "TABLE",
  TABLE_HEADER = "TABLE_HEADER",
  TABLE_ROW = "TABLE_ROW",
  TABLE_CELL = "TABLE_CELL",

  RAW_HTML = "RAW_HTML",
  HORIZONTAL_RULE = "HORIZONTAL_RULE"
}

interface Token {
  type: TokenType;
  value: string;
  children?: Token[];
  start: { line: number; column: number };
  end: { line: number; column: number };
  url?: string;
  alt?: string;
}

export { MAX_NESTING_DEPTH, TokenType, Token };

/**
Headings
Code Block
Horizontal Rule
Bold
Italic
Strikethrough
Blockquote
Links
Images
Inline Code
Unordered List
Ordered List
Tables
HTML
 */
