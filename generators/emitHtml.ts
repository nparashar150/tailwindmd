import { TokenType, type Token } from "../configs";

const getTag = (type: TokenType): { openTag: string; closeTag: string } => {
  switch (type) {
    case TokenType.HEADING_1:
      return { openTag: "<h1>", closeTag: "</h1>" };
    case TokenType.HEADING_2:
      return { openTag: "<h2>", closeTag: "</h2>" };
    case TokenType.HEADING_3:
      return { openTag: "<h3>", closeTag: "</h3>" };
    case TokenType.HEADING_4:
      return { openTag: "<h4>", closeTag: "</h4>" };
    case TokenType.HEADING_5:
      return { openTag: "<h5>", closeTag: "</h5>" };
    case TokenType.HEADING_6:
      return { openTag: "<h6>", closeTag: "</h6>" };
    case TokenType.PARAGRAPH:
      return { openTag: "<p>", closeTag: "</p>" };
    case TokenType.STRING:
      return { openTag: "", closeTag: "" };
    case TokenType.NEWLINE:
      return { openTag: "<br>", closeTag: "" };
    case TokenType.BOLD:
      return { openTag: "<strong>", closeTag: "</strong>" };
    case TokenType.ITALIC:
      return { openTag: "<em>", closeTag: "</em>" };
    case TokenType.STRIKETHROUGH:
      return { openTag: "<del>", closeTag: "</del>" };
    case TokenType.INLINE_CODE:
      return { openTag: "<code>", closeTag: "</code>" };
    case TokenType.CODE_BLOCK:
      return { openTag: "<pre><code>", closeTag: "</code></pre>" };
    case TokenType.BLOCKQUOTE:
      return { openTag: "<blockquote>", closeTag: "</blockquote>" };
    case TokenType.ORDERED_LIST:
      return { openTag: "<ol>", closeTag: "</ol>" };
    case TokenType.UNORDERED_LIST:
      return { openTag: "<ul>", closeTag: "</ul>" };
    case TokenType.LIST_ITEM:
      return { openTag: "<li>", closeTag: "</li>" };
    case TokenType.TABLE:
      return { openTag: "<table>", closeTag: "</table>" };
    case TokenType.TABLE_HEADER:
      return { openTag: "<thead>", closeTag: "</thead>" };
    case TokenType.TABLE_ROW:
      return { openTag: "<tr>", closeTag: "</tr>" };
    case TokenType.TABLE_CELL:
      return { openTag: "<td>", closeTag: "</td>" };
    case TokenType.HORIZONTAL_RULE:
      return { openTag: "<hr>", closeTag: "" };
    default:
      return { openTag: "", closeTag: "" };
  }
};

const emitHtml = (ast: Token[]): string => {
  let currentClass: string = "";

  const processNode = (node: Token): string => {
    let result = "";
    const { openTag, closeTag } = getTag(node.type);

    switch (node.type) {
      case TokenType.CLASS:
        currentClass = node.value || "";
        if (node.children && node.children.length > 0) {
          result += `<div class="${currentClass}">`;
          result += node.children.map(processNode).join("");
          result += `</div>`;
          currentClass = ""; // Reset after use
        }
        break;
      case TokenType.LINK:
        result += `<a href="${node.url}" class="underline">${node.value}</a>`;
        break;
      case TokenType.IMAGE:
        result += `<img src="${node.url}" alt="${node.alt || ""}">`;
        break;
      case TokenType.RAW_HTML:
        result += node.value || "";
        break;
      case TokenType.HORIZONTAL_RULE:
        result += "<hr>";
        break;
      default:
        let content = node.value || "";
        if (node.children && node.children.length > 0) {
          content = node.children.map(processNode).join("");
        }
        let tagOpen = openTag;
        if (currentClass && (node.type.startsWith("HEADING") || node.type === TokenType.PARAGRAPH || node.type === TokenType.BLOCKQUOTE || node.type === TokenType.CODE_BLOCK)) {
          tagOpen = tagOpen.replace(">", ` class="${currentClass}">`);
          currentClass = ""; // Reset after use
        }
        result += tagOpen + content + closeTag;
        break;
    }
    return result;
  };

  return ast.map(processNode).join("");
};

export default emitHtml;
