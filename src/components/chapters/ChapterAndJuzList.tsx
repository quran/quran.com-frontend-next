import React, { useState, useMemo, useEffect } from 'react';

import classNames from 'classnames';

import CaretDownIcon from '../../../public/icons/caret-down.svg';
import Link, { LinkVariant } from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';
import Tabs from '../dls/Tabs/Tabs';

import styles from './ChapterAndJuzList.module.scss';

import { getAllJuzMappings, getChapterData } from 'src/utils/chapter';
import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
};

enum Sort {
  ASC = 'ascending',
  DESC = 'descending',
}
enum View {
  Surah = 'surah',
  juz = 'juz',
}

const tabs = [
  { title: 'Surah', value: View.Surah },
  { title: 'Juz', value: View.juz },
];

const ChapterAndJuzList: React.FC<Props> = ({ chapters }: Props) => {
  const [view, setView] = useState(View.Surah);
  const [sortBy, setSortBy] = useState(Sort.ASC);

  const [juzMappings, setJuzMappings] = useState([]);

  useEffect(() => {
    if (view === View.juz) {
      getAllJuzMappings()
        .then((data) => Object.entries(data))
        .then(setJuzMappings);
    }
  }, [view]);

  const onSort = () => {
    setSortBy((prevValue) => (prevValue === Sort.DESC ? Sort.ASC : Sort.DESC));
  };

  const sortedChapters = useMemo(
    () =>
      sortBy === Sort.DESC
        ? chapters.slice().sort((a, b) => Number(b.id) - Number(a.id))
        : chapters,
    [sortBy, chapters],
  );

  const sortedJuzIds = useMemo(
    () =>
      sortBy === Sort.DESC
        ? juzMappings.slice().sort(([a], [b]) => Number(b) - Number(a))
        : juzMappings,
    [juzMappings, sortBy],
  );

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={(newView) => setView(newView as View)} />
        <div className={styles.sorter}>
          <div>SORT BY:</div>
          <div
            className={styles.sortByValue}
            onClick={onSort}
            role="button"
            onKeyPress={onSort}
            tabIndex={0}
          >
            <span>{sortBy}</span>
            <span className={sortBy === Sort.ASC ? styles.rotate180 : ''}>
              <CaretDownIcon />
            </span>
          </div>
        </div>
      </div>
      <div
        className={classNames({
          [styles.surahLayout]: view === View.Surah,
          [styles.juzLayout]: view === View.juz,
        })}
      >
        {view === View.Surah &&
          sortedChapters.map((chapter) => (
            <div className={styles.chapterContainer} key={chapter.id}>
              <Link href={`/${chapter.id}`}>
                <SurahPreviewRow
                  chapterId={Number(chapter.id)}
                  description={`${chapter.versesCount} Ayahs`}
                  surahName={chapter.nameSimple}
                  surahNumber={Number(chapter.id)}
                  translatedSurahName={chapter.translatedName.name}
                />
              </Link>
            </div>
          ))}
        {view === View.juz &&
          sortedJuzIds.map((juzEntry) => {
            const [juzId, chapterAndVerseMappings] = juzEntry;
            const chapterIds = Object.keys(chapterAndVerseMappings);
            return (
              <div className={styles.juzContainer}>
                <Link href={`/juz/${juzId}`} variant={LinkVariant.Primary}>
                  <div className={styles.juzTitle}>Juz {juzId}</div>
                </Link>
                {chapterIds.map((chapterId) => {
                  const chapter = getChapterData(chapterId);
                  return (
                    <div className={styles.chapterContainer} key={chapter.id}>
                      <Link href={`/${chapter.id}/${chapterAndVerseMappings[chapterId]}`}>
                        <SurahPreviewRow
                          chapterId={Number(chapter.id)}
                          description={`${chapter.versesCount} Ayahs`}
                          surahName={chapter.nameSimple}
                          surahNumber={Number(chapter.id)}
                          translatedSurahName={chapter.translatedName.name}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ChapterAndJuzList;
