import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { VerseRangeInfo } from '@/utils/verseKeys';

type Props = {
  parsedRanges: VerseRangeInfo<number>;
};

const RangesIndicator: React.FC<Props> = ({ parsedRanges }) => {
  const chaptersData = useContext(DataContext);
  const { lang } = useTranslation('quran-reader');
  const [rangeStartData, rangeEndData] = parsedRanges;
  const chapterData = getChapterData(chaptersData, rangeStartData.chapter.toString());
  let verseKeyName = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
    `${rangeStartData.chapter}:${rangeStartData.verse}`,
    lang,
  )}`;
  if (rangeStartData.verse !== rangeEndData.verse) {
    verseKeyName += `-${toLocalizedNumber(rangeEndData.verse, lang)}`;
  }
  return <div>{verseKeyName}</div>;
};

export default RangesIndicator;
