export type VerseReference = {
  chapter: number;
  from: number;
  to?: number;
};

export type ContentChunk =
  | { type: 'html'; key: string; content: string }
  | { type: 'verse'; key: string; reference: VerseReference; originalHtml: string };

/**
 * Parse a quran.com URL into a verse reference.
 * Supports: /18/1-2, /37-98, /24:30
 *
 * @param {string} href - The URL to parse
 * @returns {VerseReference | null} Parsed reference or null if invalid
 */
export function parseQuranUrl(href: string): VerseReference | null {
  try {
    const url = new URL(href);
    if (url.hostname !== 'quran.com' && !url.hostname.endsWith('.quran.com')) return null;

    const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');

    // Pattern: chapter/verse or chapter/from-to
    let match = path.match(/^(\d+)\/(\d+)(?:-(\d+))?$/);
    if (match) {
      return {
        chapter: Number(match[1]),
        from: Number(match[2]),
        to: match[3] ? Number(match[3]) : undefined,
      };
    }

    // Pattern: chapter-verse (single verse)
    match = path.match(/^(\d+)-(\d+)$/);
    if (match) {
      return { chapter: Number(match[1]), from: Number(match[2]) };
    }

    // Pattern: chapter:verse or chapter:from-to
    match = path.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (match) {
      return {
        chapter: Number(match[1]),
        from: Number(match[2]),
        to: match[3] ? Number(match[3]) : undefined,
      };
    }

    return null;
  } catch {
    return null;
  }
}

const QURAN_LINK_REGEX = /href=["'](https?:\/\/(?:[a-z0-9-]+\.)*quran\.com\/[^"']+)["']/i;

const processBlockquote = (
  blockquoteHtml: string,
  startIndex: number,
  lastIndex: number,
  html: string,
  chunks: ContentChunk[],
): number => {
  const linkMatch = blockquoteHtml.match(QURAN_LINK_REGEX);
  if (!linkMatch) return lastIndex;

  const reference = parseQuranUrl(linkMatch[1]);
  if (!reference) return lastIndex;

  if (startIndex > lastIndex) {
    const htmlBefore = html.slice(lastIndex, startIndex);
    if (htmlBefore.trim()) {
      chunks.push({ type: 'html', key: `html-${lastIndex}`, content: htmlBefore });
    }
  }

  chunks.push({
    type: 'verse',
    key: `verse-${startIndex}`,
    reference,
    originalHtml: blockquoteHtml,
  });

  return startIndex + blockquoteHtml.length;
};

/**
 * Parse lesson HTML content into renderable chunks.
 * Extracts blockquotes containing quran.com links.
 *
 * @param {string} html - The HTML content to parse
 * @returns {ContentChunk[]} Array of chunks for rendering
 */
export function parseContentChunks(html: string): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let lastIndex = 0;
  const blockquoteRegex = /<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi;
  let match = blockquoteRegex.exec(html);
  while (match) {
    lastIndex = processBlockquote(match[0], match.index, lastIndex, html, chunks);
    match = blockquoteRegex.exec(html);
  }

  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex);
    if (remaining.trim()) {
      chunks.push({ type: 'html', key: `html-${lastIndex}`, content: remaining });
    }
  }

  return chunks.length === 0 ? [{ type: 'html', key: 'html-0', content: html }] : chunks;
}
