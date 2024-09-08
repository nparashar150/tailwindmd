import { lexer } from "./lexer";
import type { Token } from "./configs";
import { TokenType, MAX_NESTING_DEPTH } from "./configs";

export const generateASTFromMarkdown = (input: string) => {
  const tokens = lexer(input);
  return tokens;
};

export type { Token };
export { TokenType, MAX_NESTING_DEPTH };

