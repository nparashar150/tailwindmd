import type { Token } from "../configs";
import { TokenType } from "../configs";

const inlineStyleLexer = (input: string, line: number): Token[] => {
  const tokens: Token[] = [];
  let cursor = 0;

  const addToken = (type: TokenType, value: string, length: number) => {
    tokens.push({
      type,
      value,
      start: { line, column: cursor },
      end: { line, column: cursor + length }
    });
    cursor += length;
  };

  while (cursor < input.length) {
    // Skip leading whitespace
    while (/\s/.test(input[cursor] || "")) {
      const whiteSpaceLength = input.slice(cursor).match(/^\s+/)?.[0].length || 0;
      addToken(TokenType.STRING, whiteSpaceLength > 1 ? Array(whiteSpaceLength)?.fill("&nbsp;")?.join(" ") : " ", whiteSpaceLength);
    }

    // ** INLINE CODE CHECK
    const inlineCodeMatch = input.slice(cursor).match(/^`([^`]+)`/);
    if (inlineCodeMatch) {
      addToken(TokenType.INLINE_CODE, inlineCodeMatch[1] || "", inlineCodeMatch[0].length);
      continue;
    }
    // ** BOLD CHECK
    const boldMatch = input.slice(cursor).match(/^\*\*(.*?)\*\*/);
    if (boldMatch) {
      addToken(TokenType.BOLD, boldMatch[1] || "", boldMatch[0].length);
      continue;
    }

    // ** ITALIC CHECK
    const italicMatch = input.slice(cursor).match(/^_(.*?)_/);
    if (italicMatch) {
      addToken(TokenType.ITALIC, italicMatch[1] || "", italicMatch[0].length);
      continue;
    }

    // ** STRIKETHROUGH CHECK
    const strikethroughMatch = input.slice(cursor).match(/^~~(.*?)~~/);
    if (strikethroughMatch) {
      addToken(TokenType.STRIKETHROUGH, strikethroughMatch[1] || "", strikethroughMatch[0].length);
      continue;
    }

    // ** LINK CHECK
    const linkMatch = input.slice(cursor).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      addToken(TokenType.LINK, linkMatch[1] || "", linkMatch[0].length);
      tokens[tokens.length - 1]!.url = linkMatch[2];
      continue;
    }

    // ** IMAGE CHECK
    const imageMatch = input.slice(cursor).match(/^!\[([^\]]+)\]\(([^)]+)\)/);
    if (imageMatch) {
      addToken(TokenType.IMAGE, "", imageMatch[0].length);
      tokens[tokens.length - 1]!.url = imageMatch[2];
      tokens[tokens.length - 1]!.alt = imageMatch[1];
      continue;
    }

    // ** TEXT CHECK
    const textMatch = input.slice(cursor).match(/^[^*_`~]+/);
    if (textMatch) {
      addToken(TokenType.STRING, textMatch[0], textMatch[0].length);
      continue;
    }

    // Move cursor forward to handle next character
    cursor++;
  }

  return tokens;
};

export default inlineStyleLexer;
