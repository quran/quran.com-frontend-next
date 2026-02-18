import styles from './LessonHtmlContent.module.scss';

import QuranWidget from '@/components/AyahWidget/QuranWidget';
import HtmlContent from '@/components/RichText/HtmlContent';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useVerseWidgetData from '@/hooks/useVerseWidgetData';
import type { WidgetTrimOptions, WordTrimRange } from '@/types/Embed';
import type { VerseReference } from '@/utils/lessonContentParser';

type Props = {
  reference: VerseReference;
  fallbackHtml: string;
};

const parseRange = (value: string): WordTrimRange | undefined => {
  const [start, end] = value.split('-');
  const s = Number(start);
  const e = Number(end);
  if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e < s) return undefined;
  return { startWordIndex: s, endWordIndex: e };
};

const parseTranslations = (value: string): Record<string, WordTrimRange> | undefined => {
  const entries = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!entries.length) return undefined;

  const result: Record<string, WordTrimRange> = {};
  const valid = entries.every((entry) => {
    const colonIdx = entry.indexOf(':');
    const id = entry.slice(0, colonIdx);
    const range = parseRange(entry.slice(colonIdx + 1));
    if (!id || !range || result[id]) return false;
    result[id] = range;
    return true;
  });
  return valid ? result : undefined;
};

const parseTrim = (fallbackHtml: string): WidgetTrimOptions | undefined => {
  const attrMatch = fallbackHtml.match(/\sdata-widget-trim=(['"])([^"']+)\1/i);
  if (!attrMatch) return undefined;

  let arabic: WordTrimRange | undefined;
  let translations: Record<string, WordTrimRange> = {};

  const valid = attrMatch[2]
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .every((section) => {
      if (section.startsWith('a:')) {
        if (arabic) return false;
        arabic = parseRange(section.slice(2));
        return Boolean(arabic);
      }
      if (section.startsWith('t:')) {
        const parsed = parseTranslations(section.slice(2));
        if (!parsed) return false;
        if (Object.keys(parsed).some((id) => translations[id])) return false;
        translations = { ...translations, ...parsed };
        return true;
      }
      return false;
    });

  if (!valid || (!arabic && !Object.keys(translations).length)) return undefined;
  return {
    ...(arabic && { arabic }),
    ...(Object.keys(translations).length && { translations }),
  };
};

const VerseChunkWidget: React.FC<Props> = ({ reference, fallbackHtml }) => {
  const { data, isValidating } = useVerseWidgetData(reference);

  if (isValidating && !data) return <Skeleton className={styles.widgetSkeleton} />;
  if (!data?.verses?.length) return <HtmlContent html={fallbackHtml} />;

  return <QuranWidget verses={data.verses} options={data.options} trim={parseTrim(fallbackHtml)} />;
};

export default VerseChunkWidget;
