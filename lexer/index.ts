import { MAX_NESTING_DEPTH, TokenType } from "../configs";
import type { Token } from "../configs";

const lexer = (input: string, depth: number = 0): Token[] => {
  const tokens: Token[] = [];
  const lines = input.split("\n")?.filter((line) => line.trim() !== "");

  if (depth > MAX_NESTING_DEPTH) {
    throw new Error("Maximum nesting depth exceeded");
  }

  let lineIndex = 0;
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    // Debugging information
    // console.log(`Processing line ${lineIndex}: ${line}`);

    if (!line) {
      lineIndex++;
      continue;
    }

    /**
     ** CLASS CHECK
     * match class multiline
     * ["text-pink-500 text-xl"]
     * # heading 1
     * or single line
     * ["text-pink-500 text-xl"] This is a text with class text-pink-500
     * in this case the class is text-pink-500
     */
    const classMatch = line.trim().match(/^\["(.*?)"\]\s*(.*)/);
    if (classMatch) {
      const classPart = classMatch[1] || "";
      const content = classMatch[2]?.trim();

      const classToken: Token = {
        type: TokenType.CLASS,
        value: classPart,
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length }
      };

      let nestedTokens = (content && lexer(content, depth + 1)) || [];
      if (nestedTokens.length > 0) {
        // Adjust the line and column numbers for nested tokens
        nestedTokens = nestedTokens.map((token) => {
          return {
            ...token,
            start: {
              line: token.start.line + lineIndex,
              column: token.start.column
            },
            end: {
              line: token.end.line + lineIndex,
              column: token.end.column
            }
          };
        });

        classToken.children = nestedTokens;
      }

      tokens.push(classToken);
      lineIndex++;
      continue;
    }

    // ** HEADING CHECK
    const headingMatch = line.trim().match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1]?.length; // Number of # determines level
      const headingType = `HEADING_${level}` as TokenType;
      tokens.push({ type: headingType, value: headingMatch[2] || "", start: { line: lineIndex + 1, column: 0 }, end: { line: lineIndex + 1, column: line.length } });
      lineIndex++;
      continue;
    }

    // ** HORIZONTAL RULE CHECK
    if (line.trim().match(/^---/)) {
      tokens.push({ type: TokenType.HORIZONTAL_RULE, value: "", start: { line: lineIndex + 1, column: 0 }, end: { line: lineIndex + 1, column: line.length } });
      lineIndex++;
      continue;
    }

    // ** BLOCKQUOTE CHECK
    if (line.trim().match(/^>/)) {
      const blockquote: Token = {
        type: TokenType.BLOCKQUOTE,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: []
      };

      // Accumulate blockquote content
      while (lineIndex < lines.length && lines[lineIndex]?.trim().startsWith(">")) {
        const blockquoteLine = lines[lineIndex]?.trim().replace(/^>\s*/, "") || ""; // Remove the blockquote marker

        // Tokenize inline styles directly within blockquote content
        const inlineTokens = inlineStyleLexer(blockquoteLine, lineIndex + 1);

        // If the inline lexer produces multiple tokens, append them directly
        if (inlineTokens.length > 0) {
          inlineTokens.forEach((token) => {
            blockquote?.children?.push(token);
          });
        } else {
          // Otherwise, add a paragraph if the content has no inline styling
          blockquote?.children?.push({
            type: TokenType.PARAGRAPH,
            value: blockquoteLine,
            start: { line: lineIndex + 1, column: 0 },
            end: { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 }
          });
        }

        blockquote.end = { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 };
        lineIndex++;
      }

      tokens.push(blockquote);
      continue;
    }

    // ** CODE BLOCK CHECK
    if (line.trim().match(/^```/)) {
      const codeBlock: Token = {
        type: TokenType.CODE_BLOCK,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length }
      };

      lineIndex++; // Move to the next line
      let codeBlockEnd = false;
      while (lineIndex < lines.length) {
        const codeBlockLine = lines[lineIndex];
        if (codeBlockLine?.trim() === "```") {
          codeBlockEnd = true;
          codeBlock.end = { line: lineIndex + 1, column: codeBlockLine.length };
          lineIndex++; // Move past the closing ```
          break;
        }
        if (codeBlockLine) {
          codeBlock.value += codeBlockLine + "\n";
        }
        lineIndex++;
      }

      if (!codeBlockEnd) {
        // Handle case where closing ``` is not found
        tokens.push({
          type: TokenType.PARAGRAPH,
          value: "```" + codeBlock.value,
          start: { line: codeBlock.start.line, column: 0 },
          end: { line: lineIndex, column: lines[lineIndex - 1]?.length || 0 }
        });
      } else {
        // Remove trailing newline if code block is correctly closed
        codeBlock.value = codeBlock.value.trimEnd();
        tokens.push(codeBlock);
      }

      continue;
    }

    // ** LIST CHECK
    const isUnorderedList = (line: string) => line.trim().match(/^[-*+]\s+/);
    const isOrderedList = (line: string) => line.trim().match(/^\d+\.\s+/);

    // ** UNORDERED LIST CHECK
    if (isUnorderedList(line)) {
      const listToken: Token = {
        type: TokenType.UNORDERED_LIST,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: []
      };

      // Accumulate list items
      while (lineIndex < lines.length && isUnorderedList(lines[lineIndex] || "")) {
        const listItemLine = lines[lineIndex];
        const listItemContent = listItemLine?.trim().replace(/^[-*+]\s+/, "") || ""; // Remove the marker

        const inlineTokens = inlineStyleLexer(listItemContent, lineIndex + 1);
        const listItemToken: Token = {
          type: TokenType.LIST_ITEM,
          value: "",
          start: { line: lineIndex + 1, column: 0 },
          end: { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 },
          children: inlineTokens
        };

        listToken?.children?.push(listItemToken);
        listToken.end = { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 };
        lineIndex++;
      }

      tokens.push(listToken);
      continue;
    }

    // ** ORDERED LIST CHECK
    if (isOrderedList(line)) {
      const listToken: Token = {
        type: TokenType.ORDERED_LIST,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: []
      };

      // Accumulate list items
      while (lineIndex < lines.length && isOrderedList(lines[lineIndex] || "")) {
        const listItemLine = lines[lineIndex];
        const listItemContent = listItemLine?.trim().replace(/^\d+\.\s+/, "") || ""; // Remove the marker

        const inlineTokens = inlineStyleLexer(listItemContent, lineIndex + 1);
        const listItemToken: Token = {
          type: TokenType.LIST_ITEM,
          value: "",
          start: { line: lineIndex + 1, column: 0 },
          end: { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 },
          children: inlineTokens
        };

        listToken?.children?.push(listItemToken);
        listToken.end = { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 };
        lineIndex++;
      }

      tokens.push(listToken);
      continue;
    }

    // ** TABLE CHECK
    const isTableSeparator = (line: string) => /^[\|\s-:]+$/.test(line.trim());
    const isTableRow = (line: string) => line.trim().startsWith("|") && line.includes("|");

    // ** TABLE PARSING
    if (isTableRow(line)) {
      const tableToken: Token = {
        type: TokenType.TABLE,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: []
      };

      // ** PARSE TABLE HEADER
      const headerLine = line.trim();
      const headerCells = headerLine
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);

      const headerToken: Token = {
        type: TokenType.TABLE_HEADER,
        value: "",
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: headerCells.map((header) => ({
          type: TokenType.TABLE_CELL,
          value: "", // Keep value "" since it's parsed into children tokens
          start: { line: lineIndex + 1, column: headerLine.indexOf(header) },
          end: { line: lineIndex + 1, column: headerLine.indexOf(header) + header.length },
          children: inlineStyleLexer(header, lineIndex + 1) // Parse inline styles
        }))
      };

      tableToken?.children?.push(headerToken);
      lineIndex++; // Move to the separator line

      // ** PARSE SEPARATOR
      if (!isTableSeparator(lines[lineIndex] || "")) {
        throw new Error("Invalid table syntax: missing separator line.");
      }
      lineIndex++; // Move to the first data row

      // ** PARSE TABLE ROWS
      while (lineIndex < lines.length && isTableRow(lines[lineIndex] || "")) {
        const rowLine = lines[lineIndex]?.trim() || "";
        const rowCells = rowLine
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);

        const rowToken: Token = {
          type: TokenType.TABLE_ROW,
          value: "",
          start: { line: lineIndex + 1, column: 0 },
          end: { line: lineIndex + 1, column: line.length },
          children: rowCells.map((cell) => ({
            type: TokenType.TABLE_CELL,
            value: "", // Keep value "" since it's parsed into children tokens
            start: { line: lineIndex + 1, column: rowLine.indexOf(cell) },
            end: { line: lineIndex + 1, column: rowLine.indexOf(cell) + cell.length },
            children: inlineStyleLexer(cell, lineIndex + 1) // Parse inline styles
          }))
        };

        tableToken?.children?.push(rowToken);
        lineIndex++;
      }

      tokens.push(tableToken);
      continue;
    }

    // ** RAW HTML CHECK
    const isRawHTML = (line: string) => line.trim().startsWith("<") && line.trim().endsWith(">");

    if (isRawHTML(line)) {
      const htmlToken: Token = {
        type: TokenType.RAW_HTML,
        value: line, // Store the entire line as raw HTML content
        start: { line: lineIndex + 1, column: 0 },
        end: { line: lineIndex + 1, column: line.length },
        children: []
      };

      // If it's a block HTML, accumulate until closing tag
      if (!line.trim().match(/^<\w+.*>.*<\/\w+>$/)) {
        // Not a self-contained HTML tag
        while (lineIndex + 1 < lines.length && !lines[lineIndex + 1]?.trim().startsWith("</")) {
          lineIndex++;
          htmlToken.value += "\n" + lines[lineIndex]; // Append the next line of HTML
          htmlToken.end = { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 };
        }

        if (lineIndex + 1 < lines.length) {
          lineIndex++; // Move past the closing tag
          htmlToken.value += "\n" + lines[lineIndex]; // Include the closing tag
          htmlToken.end = { line: lineIndex + 1, column: lines[lineIndex]?.length || 0 };
        }
      }

      tokens.push(htmlToken);
      lineIndex++;
      continue;
    }

    // ** INLINE STYLE CHECK
    const inlineTokens = inlineStyleLexer(line, lineIndex + 1);
    if (inlineTokens.length > 0) {
      tokens.push(...inlineTokens);
      lineIndex++;
      continue;
    }

    // ** NORMAL TEXT CHECK
    tokens.push({ type: TokenType.PARAGRAPH, value: line, start: { line: lineIndex + 1, column: 0 }, end: { line: lineIndex + 1, column: line.length } });
    lineIndex++;
  }

  if (depth === 0) tokens.push({ type: TokenType.EOF, value: "", start: { line: lineIndex + 1, column: 0 }, end: { line: lineIndex + 1, column: 0 } });

  return tokens;
};

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
      cursor++;
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
      addToken(TokenType.PARAGRAPH, textMatch[0], textMatch[0].length);
      continue;
    }

    // Move cursor forward to handle next character
    cursor++;
  }

  return tokens;
};

export { lexer };
