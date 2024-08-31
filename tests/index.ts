import parse from "..";

const input = `
    # Heading 1

    Some introductory text with **bold**, _italic_, and **_bold italic_** styles.

    ## Heading 2

    > This is a blockquote with **bold** text and _italic_ text.
    > 
    > - Bullet point 1 with **bold** text.
    > - Bullet point 2 with _italic_ text.

    1. Ordered list item 1 with a [link](https://example.com).
    2. Ordered list item 2 with an image ![alt text](https://example.com/image.png).

    ### Heading 3

    This is a paragraph with a \`code snippet\` and a multiline code block:

    \`\`\`
    const helloWorld = () => { console.log("Hello, World!"); };
    helloWorld();
    \`\`\`

    Here is a table:

    | Header 1       | Header 2         | Header 3   |
    |----------------|------------------|------------|
    | Row 1 Column 1 | Row 1 **Column 2** | Row 1 _Column 3_ |
    | Row 2 Column 1 | Row 2 **_Column 2_** | Row 2 Column 3  |

    And some raw HTML:

    <div class="custom-div">
      <p>This is a paragraph inside a raw HTML block.</p>
      <strong>Bold inside HTML.</strong>
    </div>

    Continuing with normal text. Another paragraph with **bold**, _italic_, and **_bold italic_** styles.

    Here is some inline HTML: <span style="color: red;">Red Text</span>.

    #### Heading 4

    - List item with a **bold** word.
      - Nested list item with _italic_ word.
        - Double-nested list item.

    Ending with a line of text.

    ##### Heading 5
    ["text-pink-500 text-xl"]
    This is a text with class text-pink-500
    ["text-pink-500 text-xl"] This is a text with class text-pink-500

    ["text-pink-500 text-xl"]
    # This is a heading with class text-blue-500
    
    ["text-pink-500 text-xl"] # This is a heading with class text-blue-500

    ---

    ["text-pink-500 text-xl"] **Bold Text**

    ["text-pink-500 text-xl"] _Italic Text_

    ["text-pink-500 text-xl"] _Italic Text_ **Bold Text**

    This is a normal text
    ---
  `;

const tokens = parse(input);
console.log(tokens);
