import { useEffect, useMemo, useState } from 'react';

import Link, { LinkVariant } from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './JuzView.module.scss';

import { getAllJuzMappings, getChapterData } from 'src/utils/chapter';

type JuzViewProps = {
  isDescending: boolean;
};

const JuzView = ({ isDescending }: JuzViewProps) => {
  const [juzMappings, setJuzMappings] = useState([]);

  useEffect(() => {
    getAllJuzMappings()
      .then((data) => Object.entries(data))
      .then(setJuzMappings);
  }, [isDescending]);

  const sortedJuzIds = useMemo(
    () =>
      isDescending ? juzMappings.slice().sort(([a], [b]) => Number(b) - Number(a)) : juzMappings,
    [isDescending, juzMappings],
  );

  if (juzMappings.length === 0) {
    return <div className={styles.loadingContainer} />;
  }

  return (
    <>
      {sortedJuzIds.map((juzEntry) => {
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
    </>
  );
};

export default JuzView;
