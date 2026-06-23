/**
 * Format prompt text safely or handle common token sanitisation
 */
export function sanitizePromptText(text: string): string {
  return text.trim().replace(/[\0\x08\x09\x1a\n\r]/g, " ");
}

/**
 * Format markdown string
 */
export function formatMarkdown(header: string, body: string): string {
  return `### ${header}\n\n${body}\n`;
}
