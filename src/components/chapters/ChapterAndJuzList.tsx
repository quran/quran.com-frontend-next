/* eslint-disable react/no-multi-comp */
import React, { useState, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CaretDownIcon from '../../../public/icons/caret-down.svg';
import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';
import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';
import JuzView from './JuzView';

import { shouldUseMinimalLayout, toLocalizedNumber } from 'src/utils/locale';
import Chapter from 'types/Chapter';

enum View {
  Surah = 'surah',
  Juz = 'juz',
}

type ChapterAndJuzListProps = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
}

const ChapterAndJuzList: React.FC<ChapterAndJuzListProps> = ({
  chapters,
}: ChapterAndJuzListProps) => {
  const { t, lang } = useTranslation('common');
  const [view, setView] = useState(View.Surah);
  const [sortBy, setSortBy] = useState(Sort.ASC);

  const onSort = () => {
    setSortBy((prevValue) => (prevValue === Sort.DESC ? Sort.ASC : Sort.DESC));
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
      sortBy === Sort.DESC
        ? chapters.slice().sort((a, b) => Number(b.id) - Number(a.id))
        : chapters,
    [sortBy, chapters],
  );

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={(newView) => setView(newView as View)} />
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
          [styles.surahLayout]: view === View.Surah,
          [styles.juzLayout]: view === View.Juz,
        })}
      >
        {view === View.Surah &&
          sortedChapters.map((chapter) => (
            <div className={styles.chapterContainer} key={chapter.id}>
              <Link href={`/${chapter.id}`}>
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
