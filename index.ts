import type { Token } from "./configs";
import { MAX_NESTING_DEPTH, TokenType } from "./configs";
import { emitHtml } from "./generators";
import { lineByLineLexer } from "./lexer";

const markToAST = (input: string) => {
  const tokens = lineByLineLexer(input);
  return tokens;
};

export { emitHtml, markToAST, MAX_NESTING_DEPTH, TokenType };
export type { Token };
