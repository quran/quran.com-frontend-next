import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import DataContext from '@/contexts/DataContext';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { RangeItemDirection } from '@/types/Range';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { parseVerseRange } from '@/utils/verseKeys';

interface VerseRangesListProps {
  ranges: string[];
  onVerseClick?: (position: RangeItemDirection, verseKey: string) => void;
}

const VerseRangesList = ({ ranges, onVerseClick }: VerseRangesListProps) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);

  const handleVerseClick = (position: RangeItemDirection, verseKey: string) => {
    if (!onVerseClick) return;

    onVerseClick(position, verseKey);
  };

  const all: React.ReactNode[] = [];

  ranges.forEach((range) => {
    const [
      { chapter: fromChapter, verse: fromVerse, verseKey: rangeFrom },
      { chapter: toChapter, verse: toVerse, verseKey: rangeTo },
    ] = parseVerseRange(range);

    const from = `${
      getChapterData(chaptersData, fromChapter).transliteratedName
    } ${toLocalizedNumber(Number(fromVerse), lang)}`;

    const to = `${getChapterData(chaptersData, toChapter).transliteratedName} ${toLocalizedNumber(
      Number(toVerse),
      lang,
    )}`;

    all.push(
      <>
        <Link
          href={getChapterWithStartingVerseUrl(rangeFrom)}
          variant={LinkVariant.Blend}
          onClick={() => handleVerseClick(RangeItemDirection.From, rangeFrom)}
        >
          {from}
        </Link>
        {` ${t('common:to')} `}
        <Link
          href={getChapterWithStartingVerseUrl(rangeTo)}
          variant={LinkVariant.Blend}
          onClick={() => handleVerseClick(RangeItemDirection.To, rangeTo)}
        >
          {to}
        </Link>
      </>,
    );
  });

  if (all.length === 0) return null;

  return all.length > 1 ? (
    <ul>
      {all.map((range, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={idx}>{range}</div>
      ))}
    </ul>
  ) : (
    <>{all}</>
  );
};

export default VerseRangesList;
