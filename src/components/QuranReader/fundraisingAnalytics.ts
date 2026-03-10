import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from 'types/Verse';

export enum ReaderFundraisingBannerPlacement {
  EndOfScrolling = 'end_of_scroll',
  Floating = 'floating',
}

export const getReaderBannerAnalyticsSource = (
  dataType: QuranReaderDataType,
  placement: ReaderFundraisingBannerPlacement = ReaderFundraisingBannerPlacement.EndOfScrolling,
): string => {
  const placementSuffix =
    placement === ReaderFundraisingBannerPlacement.Floating
      ? 'floating_banner'
      : 'end_of_scroll_banner';

  switch (dataType) {
    case QuranReaderDataType.Juz:
      return `quran_reader_juz_${placementSuffix}`;
    case QuranReaderDataType.Page:
      return `quran_reader_page_${placementSuffix}`;
    case QuranReaderDataType.Verse:
    case QuranReaderDataType.ChapterVerseRanges:
    case QuranReaderDataType.Ranges:
      return `quran_reader_range_${placementSuffix}`;
    case QuranReaderDataType.Hizb:
      return `quran_reader_hizb_${placementSuffix}`;
    case QuranReaderDataType.Rub:
      return `quran_reader_rub_${placementSuffix}`;
    default:
      return `quran_reader_chapter_${placementSuffix}`;
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
