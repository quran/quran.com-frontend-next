/**
 * Replaces <br> tags with <span> elements based on their consecutiveness.
 * Multiple consecutive <br> tags are replaced with a single <span class="multiline">.
 * Single <br> tags are replaced with <span class="single">.
 * @param {string} html - The HTML string to process
 * @returns {string} The processed HTML string with <br> tags replaced by spans
 */
export default function replaceBreaksWithSpans(html: string): string {
  // Match 2 or more consecutive <br> tags (with optional self-closing and spacing)
  // and replace with multiline span
  const multilinePattern = /(<br\s*\/?>\s*){2,}/gi;
  const result = html.replace(multilinePattern, '<span class="multiline"></span>');

  // Match single <br> tags and replace with single span
  const singlePattern = /<br\s*\/?>/gi;
  const finalResult = result.replace(singlePattern, '<span class="single"></span>');

  return finalResult;
}
