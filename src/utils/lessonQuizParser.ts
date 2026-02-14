export type LessonQuizOption = {
  id: string;
  text: string;
};

export type LessonQuizQuestion = {
  id: string;
  question: string;
  options: LessonQuizOption[];
  correctOptionId: string;
};

export type ParsedLessonQuiz = {
  contentWithoutQuizSection: string;
  headingText: string;
  question: LessonQuizQuestion;
};

const QUESTION_HEADING_REGEX =
  /<h[1-6][^>]*>\s*(?:<strong>\s*)?Question[\s\S]*?(?:<\/strong>\s*)?<\/h[1-6]>/gi;

const OPTION_LINE_REGEX = /^([A-D])\)\s*(.+)$/i;

const normalizeHtmlToLines = (html: string): string[] => {
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, ' ');

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const parseOptionLines = (lines: string[], firstOptionLineIndex: number) => {
  const optionTexts: string[] = [];
  let currentOptionIndex = -1;

  for (let i = firstOptionLineIndex; i < lines.length; i += 1) {
    const line = lines[i];
    const optionMatch = line.match(OPTION_LINE_REGEX);

    if (optionMatch) {
      const label = optionMatch[1].toUpperCase();
      const expectedLabel = String.fromCharCode(65 + optionTexts.length);
      if (optionTexts.length >= 4) return null;
      if (label !== expectedLabel) return null;

      optionTexts.push(optionMatch[2].trim());
      currentOptionIndex = optionTexts.length - 1;
    } else {
      if (currentOptionIndex === -1) return null;
      optionTexts[currentOptionIndex] = `${optionTexts[currentOptionIndex]} ${line}`.trim();
    }
  }

  if (optionTexts.length !== 4) return null;

  return optionTexts;
};

const parseQuestionBlock = (blockHtml: string): LessonQuizQuestion | null => {
  const lines = normalizeHtmlToLines(blockHtml);
  if (!lines.length) return null;

  const firstOptionLineIndex = lines.findIndex((line) => OPTION_LINE_REGEX.test(line));
  if (firstOptionLineIndex === -1) return null;

  const question = lines.slice(0, firstOptionLineIndex).join(' ').replace(/\s+/g, ' ').trim();
  if (!question) return null;

  const optionTexts = parseOptionLines(lines, firstOptionLineIndex);
  if (!optionTexts) return null;

  return {
    id: 'q1',
    question,
    options: optionTexts.map((text, optionIndex) => ({
      id: String.fromCharCode(97 + optionIndex),
      text,
    })),
    correctOptionId: 'a',
  };
};

const parseLessonQuizFromHtml = (html: string): ParsedLessonQuiz | null => {
  const headingMatches = Array.from(html.matchAll(QUESTION_HEADING_REGEX));
  const lastHeading = headingMatches[headingMatches.length - 1];
  if (!lastHeading) return null;

  const headingHtml = lastHeading[0];
  const headingText = normalizeHtmlToLines(headingHtml).join(' ').replace(/\s+/g, ' ').trim();
  const startIndex = lastHeading.index ?? 0;
  const question = parseQuestionBlock(html.slice(startIndex + headingHtml.length));
  if (!question) return null;

  return {
    contentWithoutQuizSection: html.slice(0, startIndex).replace(/\s+$/g, ''),
    headingText,
    question,
  };
};

export default parseLessonQuizFromHtml;
