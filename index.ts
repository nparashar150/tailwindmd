import { lexer } from "./lexer";

export const generateASTFromMarkdown = (input: string) => {
  const tokens = lexer(input);
  return tokens;
};

