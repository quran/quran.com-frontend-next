import useTranslation from 'next-translate/useTranslation';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './ChapterAndJuzList.module.scss';
import VirtualGrid from './VirtualGrid';

import Chapter from '@/types/Chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

const MOST_VISITED_CHAPTERS = {
  1: true,
  2: true,
  3: true,
  4: true,
  18: true,
  32: true,
  36: true,
  55: true,
  56: true,
  67: true,
};

type SurahViewProps = {
  sortedChapters: Chapter[];
};

const SurahView: React.FC<SurahViewProps> = ({ sortedChapters }: SurahViewProps) => {
  const { t, lang } = useTranslation();
  return (
    <VirtualGrid
      renderRow={(rowIndex, gridNumCols) => {
        const row = Array.from({ length: gridNumCols }).map((EMPTY, colIndex) => {
          const cellIndex = rowIndex * gridNumCols + colIndex;
          const chapter = sortedChapters[cellIndex];
          return (
            <div key={chapter.id} className={styles.chapterContainer}>
              <Link
                href={`/${chapter.id}`}
                shouldPrefetch={MOST_VISITED_CHAPTERS[Number(chapter.id)] === true}
              >
                <SurahPreviewRow
                  chapterId={Number(chapter.id)}
                  description={`${toLocalizedNumber(chapter.versesCount, lang)} ${t(
                    'common:ayahs',
                  )}`}
                  surahName={chapter.transliteratedName}
                  surahNumber={Number(chapter.id)}
                  translatedSurahName={chapter.translatedName as string}
                  isMinimalLayout={shouldUseMinimalLayout(lang)}
                />
              </Link>
            </div>
          );
        });
        return row;
      }}
    />
  );
};

export default SurahView;
