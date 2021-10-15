import React, { useState } from 'react';

import classNames from 'classnames';

import Link from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';
import Tabs from '../dls/Tabs/Tabs';

import styles from './ChaptersList.module.scss';

import { getChapterData, getChapterIdsForJuz } from 'src/utils/chapter';
import Chapter from 'types/Chapter';

type Props = {
  chapters: Chapter[];
};

const tabs = [
  { title: 'Surah', value: 'chapter' },
  { title: 'Juz', value: 'juz' },
];

// @ts-ignore
const juzs = [...Array(30).keys()].map((n) => n + 1);

const ChaptersAndJuzsList: React.FC<Props> = ({ chapters }: Props) => {
  const [view, setView] = useState('juz');

  return (
    <>
      <div className={styles.tabsContainer}>
        <Tabs tabs={tabs} selected={view} onSelect={(newView) => setView(newView)} />
      </div>
      <div
        className={classNames({
          [styles.container]: view === 'chapter',
          [styles.masonry]: view === 'juz',
        })}
      >
        {view === 'chapter' &&
          chapters.map((chapter) => (
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
        {view === 'juz' &&
          juzs.map((juzId) => {
            const chapterIds = getChapterIdsForJuz(juzId);
            return (
              <div className={styles.juzContainer}>
                <div className={styles.juzTitle}>Juz {juzId}</div>
                {chapterIds.map((chapterId) => {
                  const chapter = getChapterData(chapterId);
                  return (
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
                  );
                })}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ChaptersAndJuzsList;
