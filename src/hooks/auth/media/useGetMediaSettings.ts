import { useContext, useMemo } from 'react';

import DataContext from '@/contexts/DataContext';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import AvailableTranslation from '@/types/AvailableTranslation';
import Alignment from '@/types/Media/Alignment';
import MediaSettings from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';
import QueryParam from '@/types/QueryParam';
import { QuranFont } from '@/types/QuranReader';
import Reciter from '@/types/Reciter';

const useGetMediaSettings = (
  reciters: Reciter[],
  translationsData: AvailableTranslation[],
): MediaSettings => {
  const chaptersData = useContext(DataContext);
  const { value: verseTo }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.VERSE_TO,
    chaptersData,
  );
  const { value: verseFrom }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.VERSE_FROM,
    chaptersData,
  );
  const { value: opacity }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.OPACITY);
  const { value: reciter }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.RECITER,
    null,
    reciters,
  );
  const { value: quranTextFontScale }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.QURAN_TEXT_FONT_SCALE,
  );
  const { value: quranTextFontStyle }: { value: QuranFont } = useGetQueryParamOrReduxValue(
    QueryParam.QURAN_TEXT_FONT_STYLE,
  );
  const { value: translationFontScale }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATION_FONT_SCALE,
  );
  const { value: translations }: { value: number[] } = useGetQueryParamOrReduxValue(
    QueryParam.MEDIA_TRANSLATIONS,
    null,
    translationsData,
  );
  const { value: backgroundColor }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.BACKGROUND_COLOR,
  );
  const { value: borderColor }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.BORDER_COLOR,
  );
  const { value: borderSize }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.BORDER_SIZE,
  );
  const { value: fontColor }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.FONT_COLOR,
  );
  const { value: verseAlignment }: { value: Alignment } = useGetQueryParamOrReduxValue(
    QueryParam.VERSE_ALIGNMENT,
  );
  const { value: translationAlignment }: { value: Alignment } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATION_ALIGNMENT,
  );
  const { value: orientation }: { value: Orientation } = useGetQueryParamOrReduxValue(
    QueryParam.ORIENTATION,
  );
  const { value: videoId }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.VIDEO_ID);
  const { value: surah }: { value: number } = useGetQueryParamOrReduxValue(QueryParam.SURAH);

  return useMemo(() => {
    return {
      verseTo,
      verseFrom,
      backgroundColor,
      borderColor,
      borderSize,
      opacity,
      reciter,
      quranTextFontScale,
      quranTextFontStyle,
      translationFontScale,
      translations,
      fontColor,
      verseAlignment,
      translationAlignment,
      orientation,
      videoId,
      surah,
    };
  }, [
    backgroundColor,
    borderColor,
    borderSize,
    fontColor,
    opacity,
    orientation,
    quranTextFontScale,
    quranTextFontStyle,
    reciter,
    surah,
    translationAlignment,
    translationFontScale,
    translations,
    verseAlignment,
    verseFrom,
    verseTo,
    videoId,
  ]);
};

export default useGetMediaSettings;
