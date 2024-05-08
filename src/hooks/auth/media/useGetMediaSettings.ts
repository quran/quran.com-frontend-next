import { useContext } from 'react';

import DataContext from '@/contexts/DataContext';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import Alignment from '@/types/Media/Alignment';
import MediaSettings from '@/types/Media/MediaSettings';
import Orientation from '@/types/Media/Orientation';
import QueryParam from '@/types/QueryParam';

// TODO: corner case when from and to are not valid. Also when surah and ranges are not in the same surah
// TODO: write test cases
const useGetMediaSettings = (): MediaSettings => {
  const chaptersData = useContext(DataContext);
  const { value: verseTo }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.VERSE_TO,
    chaptersData,
  );
  const { value: verseFrom }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.VERSE_FROM,
    chaptersData,
  );
  const { value: shouldHaveBorder }: { value: string } = useGetQueryParamOrReduxValue(
    QueryParam.SHOULD_HAVE_BORDER,
  );
  const { value: backgroundColorId }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.BACKGROUND_COLOR_ID,
  );
  const { value: opacity }: { value: string } = useGetQueryParamOrReduxValue(QueryParam.OPACITY);
  const { value: reciter }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.MEDIA_RECITER,
  );
  const { value: quranTextFontScale }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.QURAN_TEXT_FONT_SCALE,
  );
  const { value: translationFontScale }: { value: number } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATION_FONT_SCALE,
  );
  const { value: translations }: { value: number[] } = useGetQueryParamOrReduxValue(
    QueryParam.MEDIA_TRANSLATIONS,
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

  return {
    verseTo,
    verseFrom,
    shouldHaveBorder,
    backgroundColorId,
    opacity,
    reciter,
    quranTextFontScale,
    translationFontScale,
    translations,
    fontColor,
    verseAlignment,
    translationAlignment,
    orientation,
    videoId,
    surah,
  };
};

export default useGetMediaSettings;
