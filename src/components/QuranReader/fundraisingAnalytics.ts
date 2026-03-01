import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from 'types/Verse';

export const getReaderBannerAnalyticsSource = (dataType: QuranReaderDataType): string => {
  switch (dataType) {
    case QuranReaderDataType.Juz:
      return 'quran_reader_juz_floating_banner';
    case QuranReaderDataType.Page:
      return 'quran_reader_page_floating_banner';
    case QuranReaderDataType.Verse:
    case QuranReaderDataType.ChapterVerseRanges:
    case QuranReaderDataType.Ranges:
      return 'quran_reader_range_floating_banner';
    case QuranReaderDataType.Hizb:
      return 'quran_reader_hizb_floating_banner';
    case QuranReaderDataType.Rub:
      return 'quran_reader_rub_floating_banner';
    default:
      return 'quran_reader_chapter_floating_banner';
  }
};

export const getReaderBannerAnalyticsParams = (
  dataType: QuranReaderDataType,
  id: number | string,
  firstVerse?: Verse,
): Record<string, any> => {
  switch (dataType) {
    case QuranReaderDataType.Juz:
      return { juzNumber: Number(id) };
    case QuranReaderDataType.Page:
      return { pageNumber: Number(id) };
    case QuranReaderDataType.Hizb:
      return { hizbNumber: Number(id) };
    case QuranReaderDataType.Rub:
      return { rubNumber: Number(id) };
    case QuranReaderDataType.Verse:
    case QuranReaderDataType.ChapterVerseRanges:
    case QuranReaderDataType.Ranges:
      return firstVerse?.verseKey ? { verseKey: firstVerse.verseKey } : {};
    default:
      return { chapterId: Number(id) };
  }
};
