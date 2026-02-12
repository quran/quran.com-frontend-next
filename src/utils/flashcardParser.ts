import { FlashCardData, FlashCardVariant } from '@/components/Course/FlashCards/types';

function extractVariant(headingTag: string): FlashCardVariant {
  const classes = headingTag.match(/class=["']([^"']*)["']/)?.[1] || '';
  if (/\bflashcard-carousel\b/.test(classes)) return FlashCardVariant.Carousel;
  return FlashCardVariant.List;
}

export default function parseFlashcardsFromHtml(html: string): {
  beforeHtml: string;
  flashcards: FlashCardData[];
  afterHtml: string;
  variant: FlashCardVariant;
} | null {
  const headingRegex = /<h3[^>]*>[\s\S]*?Word-by-word\s+breakdown[\s\S]*?<\/h3>/i;
  const headingMatch = html.match(headingRegex);

  if (!headingMatch || headingMatch.index === undefined) return null;

  const variant = extractVariant(headingMatch[0]);
  const headingEndIndex = headingMatch.index + headingMatch[0].length;
  const beforeHtml = html.slice(0, headingMatch.index);

  const afterHeadingContent = html.slice(headingEndIndex);
  const nextSectionMatch = afterHeadingContent.match(/<h3[^>]*>|<hr\s*\/?>/i);

  let wordByWordHtml: string;
  let afterHtml: string;

  if (nextSectionMatch && nextSectionMatch.index !== undefined) {
    wordByWordHtml = afterHeadingContent.slice(0, nextSectionMatch.index);
    afterHtml = afterHeadingContent.slice(nextSectionMatch.index);
  } else {
    wordByWordHtml = afterHeadingContent;
    afterHtml = '';
  }

  const flashcards = extractFlashcardsFromSection(wordByWordHtml);
  if (flashcards.length === 0) return null;

  return { beforeHtml, flashcards, afterHtml, variant };
}

function extractFlashcardsFromSection(html: string): FlashCardData[] {
  const flashcards: FlashCardData[] = [];
  const paragraphRegex = /<p[^>]*dir=["']rtl["'][^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = paragraphRegex.exec(html)) !== null) {
    const cardData = parseWordParagraph(match[1]);
    if (cardData) {
      flashcards.push({ ...cardData, id: `flashcard-${flashcards.length}` });
    }
  }

  return flashcards;
}

function parseWordParagraph(html: string): Omit<FlashCardData, 'id'> | null {
  const arabicMatch = html.match(/<strong[^>]*>(.*?)<\/strong>/i);
  if (!arabicMatch) return null;

  const arabic = stripHtmlTags(arabicMatch[1]).trim();
  if (!arabic) return null;

  const transliterationMatch = html.match(/<em[^>]*>(.*?)<\/em>/i);
  const transliteration = transliterationMatch ? stripHtmlTags(transliterationMatch[1]).trim() : '';

  const translationMatch = html.match(/\)\s*-\s*([\s\S]+?)$/);
  let translation = '';
  if (translationMatch) {
    translation = stripHtmlTags(translationMatch[1])
      .trim()
      .replace(/^\s*\(?/, '')
      .replace(/\)?\s*$/, '')
      .trim();
  }

  return { arabic, transliteration, translation: translation || '(translation missing)' };
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
}
