import useTranslation from 'next-translate/useTranslation';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import { View } from './ChapterAndJuzList';
import styles from './ChapterAndJuzList.module.scss';
import VirtualGrid from './VirtualGrid';

import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

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
      view={View.Surah}
      renderRow={(gridNumCols, rowIndex) => {
        Array.from({ length: gridNumCols }).map((AHO, columnIndex) => {
          const cellIndex = rowIndex * gridNumCols + columnIndex;
          const chapter = sortedChapters[cellIndex];
          return (
            <div key={`i-${cellIndex}`} className={styles.chapterContainer} style={{ flex: 1 }}>
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
      }}
    />
  );
};

export default SurahView;
