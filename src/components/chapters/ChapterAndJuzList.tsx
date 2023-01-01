/* eslint-disable react/no-multi-comp */
import React, { useState, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';
import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';
import ChapterAndJuzListSkeleton from './ChapterAndJuzListSkeleton';

import CaretDownIcon from '@/icons/caret-down.svg';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import Chapter from 'types/Chapter';

enum View {
  SURAH = 'surah',
  JUZ = 'juz',
  REVELATION_ORDER = 'revelation_order',
}

const JuzView = dynamic(() => import('./JuzView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

const RevelationOrderView = dynamic(() => import('./RevelationOrderView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

type ChapterAndJuzListProps = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
}

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

const ChapterAndJuzList: React.FC<ChapterAndJuzListProps> = ({
  chapters,
}: ChapterAndJuzListProps) => {
  const { t, lang } = useTranslation('common');
  const [view, setView] = useState(View.SURAH);
  const [sortBy, setSortBy] = useState(Sort.ASC);

  const onSort = () => {
    setSortBy((prevValue) => {
      const newValue = prevValue === Sort.DESC ? Sort.ASC : Sort.DESC;
      // eslint-disable-next-line i18next/no-literal-string
      logValueChange(`homepage_${view}_sorting`, prevValue, newValue);
      return newValue;
    });
  };

  const tabs = useMemo(
    () => [
      { title: t(`${View.SURAH}`), value: View.SURAH },
      { title: t(`${View.JUZ}`), value: View.JUZ },
      { title: t(`${View.REVELATION_ORDER}`), value: View.REVELATION_ORDER },
    ],
    [t],
  );

  const sortedChapters = useMemo(
    () =>
      sortBy === Sort.DESC
        ? chapters.slice().sort((a, b) => Number(b.id) - Number(a.id))
        : chapters,
    [sortBy, chapters],
  );

  const onTabSelected = (newView) => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`homepage_${newView}_tab`);
    setView(newView as View);
  };

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={onTabSelected} />
        <div className={styles.sorter}>
          <div className={styles.uppercase}>{t('sort.by')}:</div>
          <div
            className={styles.sortByValue}
            onClick={onSort}
            role="button"
            onKeyPress={onSort}
            tabIndex={0}
          >
            <span>{t(`sort.${sortBy}`)}</span>
            <span className={sortBy === Sort.ASC ? styles.rotate180 : ''}>
              <CaretDownIcon />
            </span>
          </div>
        </div>
      </div>
      <div
        className={classNames({
          [styles.surahLayout]: view === View.SURAH || view === View.REVELATION_ORDER,
          [styles.juzLayout]: view === View.JUZ,
        })}
      >
        {view === View.SURAH &&
          sortedChapters.map((chapter) => (
            <div className={styles.chapterContainer} key={chapter.id}>
              <Link
                href={`/${chapter.id}`}
                shouldPrefetch={MOST_VISITED_CHAPTERS[Number(chapter.id)] === true}
              >
                <SurahPreviewRow
                  chapterId={Number(chapter.id)}
                  description={`${toLocalizedNumber(chapter.versesCount, lang)} ${t('ayahs')}`}
                  surahName={chapter.transliteratedName}
                  surahNumber={Number(chapter.id)}
                  translatedSurahName={chapter.translatedName as string}
                  isMinimalLayout={shouldUseMinimalLayout(lang)}
                />
              </Link>
            </div>
          ))}
        {view === View.JUZ && <JuzView isDescending={sortBy === Sort.DESC} />}
        {view === View.REVELATION_ORDER && (
          <RevelationOrderView isDescending={sortBy === Sort.DESC} chapters={chapters} />
        )}
      </div>
    </>
  );
};

export default ChapterAndJuzList;
