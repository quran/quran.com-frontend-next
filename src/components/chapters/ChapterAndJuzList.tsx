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
import { openStdin } from 'process';

enum View {
  Surah = 'surah',
  Juz = 'juz',
}

const JuzView = dynamic(() => import('./JuzView'), {
  ssr: false,
  loading: () => <ChapterAndJuzListSkeleton />,
});

type ChapterAndJuzListProps = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
  A_ASC = 'a_ascending',
  A_DESC = 'a_descending',
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
  const [view, setView] = useState(View.Surah);
  const [sortBy, setSortBy] = useState(Sort.ASC);

  const onSort = () => {
    setSortBy((prevValue) => {

      var dropdown = document.getElementById("dropdown") as HTMLSelectElement;
      var option_value = dropdown.options[dropdown.selectedIndex].value;
 
      const newValue = option_value === "ASC" 
      ? Sort.ASC 
      : option_value === "DESC"  
      ? Sort.DESC
      : option_value === "A_ASC"
      ? Sort.A_ASC
      : Sort.A_DESC
      ;

      // eslint-disable-next-line i18next/no-literal-string
      logValueChange(`homepage_${view}_sorting`, prevValue, newValue);
      return newValue;
    });
  };

  const tabs = useMemo(
    () => [
      { title: t(`${View.Surah}`), value: View.Surah },
      { title: t(`${View.Juz}`), value: View.Juz },
    ],
    [t],
  );

  const sortedChapters = useMemo(
    () =>
      sortBy === Sort.ASC
        ? chapters
        : sortBy === Sort.DESC
        ? chapters.slice().sort((a, b) => Number(b.id) - Number(a.id))
        : sortBy === Sort.A_ASC
        ? chapters.slice().sort((a, b) => Number(a.versesCount) - Number(b.versesCount))
        : chapters.slice().sort((a, b) => Number(b.versesCount) - Number(a.versesCount)),
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
          <div className={styles.uppercase}>{t('sort.by')}:  
            <select id="dropdown" onChange={onSort}>
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
              <option value="A_ASC">Ascending Ayahs</option>
              <option value="A_DESC">Descieding Ayahs</option>
            </select>
          
          </div>
        </div>
      </div>
      <div
        className={classNames({
          [styles.surahLayout]: view === View.Surah,
          [styles.juzLayout]: view === View.Juz,
        })}
      >
        {view === View.Surah &&
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
        {view === View.Juz && <JuzView isDescending={sortBy === Sort.DESC} />}
      </div>
    </>
  );
};

export default ChapterAndJuzList;
