/**
 * Parses markdown-style formatting and returns structured content
 * Handles headings (#, ##, ###), bold (**text**), italic (*text*), lists, etc.
 */
export function parseMessageContent(text) {
  // Split by lines to preserve structure
  const lines = text.split('\n');
  const elements = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push({ type: 'spacer' });
      i++;
      continue;
    }

    // Heading detection (# ## ###)
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      elements.push({
        type: 'heading',
        level,
        content: text
      });
      i++;
      continue;
    }

    // Unordered list detection (- or *)
    const listMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (listMatch) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*]\s+/)) {
        items.push(lines[i].replace(/^[\s]*[-*]\s+/, '').trim());
        i++;
      }
      elements.push({
        type: 'list',
        items
      });
      continue;
    }

    // Numbered list detection (1. 2. etc)
    const numberedMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (numberedMatch) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\s]*\d+\.\s+/)) {
        items.push(lines[i].replace(/^[\s]*\d+\.\s+/, '').trim());
        i++;
      }
      elements.push({
        type: 'numberedList',
        items
      });
      continue;
    }

    // Code block detection (```code```)
    if (line.trim().startsWith('```')) {
      const codeLines = [line.replace(/```/g, '').trim()];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // Skip closing ```
      elements.push({
        type: 'code',
        content: codeLines.join('\n').trim()
      });
      continue;
    }

    // Regular paragraph
    elements.push({
      type: 'paragraph',
      content: line.trim()
    });
    i++;
  }

  return elements;
}

/**
 * Formats inline text with markdown-style formatting (bold, italic, etc.)
 */
export function formatInlineText(text) {
  // Bold: **text** -> strong
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* -> em
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Code: `text` -> code
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');

  return text;
}
