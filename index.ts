import { lineByLineLexer } from "./lexer";
import type { Token } from "./configs";
import { TokenType, MAX_NESTING_DEPTH } from "./configs";

const markToAST = (input: string) => {
  const tokens = lineByLineLexer(input);
  return tokens;
};

export type { Token };
export { TokenType, markToAST, MAX_NESTING_DEPTH };

