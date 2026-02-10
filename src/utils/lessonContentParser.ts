export type VerseReference = {
  chapter: number;
  from: number;
  to?: number;
};

export type ContentChunk =
  | { type: 'html'; content: string }
  | { type: 'verse'; reference: VerseReference; originalHtml: string };

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
    if (!url.hostname.includes('quran.com')) return null;

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

    // Pattern: chapter:verse
    match = path.match(/^(\d+):(\d+)$/);
    if (match) {
      return { chapter: Number(match[1]), from: Number(match[2]) };
    }

    return null;
  } catch {
    return null;
  }
}

const BLOCKQUOTE_REGEX = /<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi;
const QURAN_LINK_REGEX = /href=["'](https?:\/\/quran\.com\/[^"']+)["']/i;

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

  // Add HTML before this blockquote
  if (startIndex > lastIndex) {
    const htmlBefore = html.slice(lastIndex, startIndex);
    if (htmlBefore.trim()) {
      chunks.push({ type: 'html', content: htmlBefore });
    }
  }

  // Add verse chunk with original HTML for fallback
  chunks.push({ type: 'verse', reference, originalHtml: blockquoteHtml });

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
  let match: RegExpExecArray | null;

  BLOCKQUOTE_REGEX.lastIndex = 0;

  // eslint-disable-next-line no-cond-assign
  while ((match = BLOCKQUOTE_REGEX.exec(html)) !== null) {
    lastIndex = processBlockquote(match[0], match.index, lastIndex, html, chunks);
  }

  // Add remaining HTML
  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex);
    if (remaining.trim()) {
      chunks.push({ type: 'html', content: remaining });
    }
  }

  return chunks.length === 0 ? [{ type: 'html', content: html }] : chunks;
}
