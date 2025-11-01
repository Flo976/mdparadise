/**
 * Auto-format text to proper markdown by detecting common patterns
 * like emoji headings, bullet lists, checkboxes, etc.
 */
export function autoFormatToMarkdown(text: string): string {
  const lines = text.split('\n');
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      formattedLines.push('');
      continue;
    }

    // PRIORITY 1: Detect checkbox items BEFORE emoji headings
    // Unchecked: "☐ Task" or "  ☐ Task" or "  - ☐ Task" (with or without bullet)
    const checkboxMatch = line.match(/^(\s*)(?:-\s*)?[☐□▢⬜]\s+(.+)$/u);
    if (checkboxMatch) {
      const indent = checkboxMatch[1];
      const task = checkboxMatch[2].trim();
      formattedLines.push(`${indent}- [ ] ${task}`);
      continue;
    }

    // Checked: "☑ Done" or "✓ Done" or "✅ Done" or "  - ✅ Done" (with or without bullet)
    const checkedMatch = line.match(/^(\s*)(?:-\s*)?[☑✓✅✔︎⍻]\s+(.+)$/u);
    if (checkedMatch) {
      const indent = checkedMatch[1];
      const task = checkedMatch[2].trim();
      formattedLines.push(`${indent}- [x] ${task}`);
      continue;
    }

    // PRIORITY 2: Detect emoji headings (but NOT checkbox emojis)
    // Pattern: emoji at start, optional space, then text
    const emojiHeadingMatch = line.match(/^(\s*)([\p{Emoji}\u{1F000}-\u{1F9FF}])\s+(.+)$/u);
    if (emojiHeadingMatch) {
      const indent = emojiHeadingMatch[1];
      const emoji = emojiHeadingMatch[2];
      const title = emojiHeadingMatch[3].trim();

      // Skip if it's a checkbox emoji (already handled above)
      if (!/^[☐□▢⬜☑✓✅✔︎⍻]/.test(emoji)) {
        // Determine heading level based on context
        // Main sections (with major emojis) are ## (H2)
        // Subsections are ### (H3)
        const isMainSection = /^[📋🎯🔍💡📦🌍]/.test(emoji);
        const headingLevel = isMainSection ? '##' : '###';

        formattedLines.push(`${indent}${headingLevel} ${emoji} ${title}`);
        continue;
      }
    }

    // Detect numbered headings (e.g., "1. Interface utilisateur :")
    const numberedHeadingMatch = line.match(/^(\s*)(\d+)\.\s+([^:]+):\s*$/);
    if (numberedHeadingMatch) {
      const indent = numberedHeadingMatch[1];
      const number = numberedHeadingMatch[2];
      const title = numberedHeadingMatch[3].trim();
      formattedLines.push(`${indent}${number}. **${title}:**`);
      continue;
    }

    // Detect bullet points with dashes (e.g., "  - Item")
    // Keep as is, already in markdown format
    const bulletMatch = line.match(/^(\s*)-\s+(.+)$/);
    if (bulletMatch) {
      formattedLines.push(line);
      continue;
    }

    // Detect indented items that should be bullet points
    // If line starts with significant indentation followed by text
    const indentedItemMatch = line.match(/^(\s{2,})([^-\d])(.+)$/);
    if (indentedItemMatch && !line.includes('```')) {
      const indent = indentedItemMatch[1];
      const content = indentedItemMatch[2] + indentedItemMatch[3];
      // Only convert to bullet if it looks like a list item (not a continuation)
      if (i > 0 && formattedLines[formattedLines.length - 1].trim().match(/^[-\d]/)) {
        formattedLines.push(`${indent}- ${content.trim()}`);
        continue;
      }
    }

    // Detect potential bold text (text between asterisks or underscores)
    // Already formatted, keep as is

    // Detect "Voulez-vous" or question patterns at end - keep as paragraph
    if (line.match(/^(Voulez-vous|Quelle|Comment|Pourquoi)/i)) {
      formattedLines.push(line);
      continue;
    }

    // Default: keep line as is
    formattedLines.push(line);
  }

  // Join lines and clean up excessive blank lines
  let result = formattedLines.join('\n');

  // Replace 3+ consecutive blank lines with just 2
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

/**
 * Analyze text and provide formatting suggestions
 */
export function analyzeFormattingOpportunities(text: string): {
  hasEmojiHeadings: boolean;
  hasCheckboxes: boolean;
  hasBulletPoints: boolean;
  hasNumberedLists: boolean;
  needsFormatting: boolean;
} {
  const hasEmojiHeadings = /^[\p{Emoji}\u{1F000}-\u{1F9FF}]\s+/mu.test(text);
  const hasCheckboxes = /[☐□▢⬜☑✓✅✔︎]\s+/u.test(text);
  const hasBulletPoints = /^\s*-\s+/m.test(text);
  const hasNumberedLists = /^\s*\d+\.\s+/m.test(text);

  const needsFormatting = hasEmojiHeadings || hasCheckboxes;

  return {
    hasEmojiHeadings,
    hasCheckboxes,
    hasBulletPoints,
    hasNumberedLists,
    needsFormatting,
  };
}
