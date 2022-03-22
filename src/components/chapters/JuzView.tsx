import { useContext, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Link, { LinkVariant } from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './JuzView.module.scss';

import DataContext from 'src/contexts/DataContext';
import { getAllJuzMappings, getChapterData } from 'src/utils/chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from 'src/utils/locale';

type JuzViewProps = {
  isDescending: boolean;
};

const JuzView = ({ isDescending }: JuzViewProps) => {
  const { t, lang } = useTranslation('common');
  const [juzMappings, setJuzMappings] = useState([]);
  const chaptersData = useContext(DataContext);

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
          <div key={juzId} className={styles.juzContainer}>
            <Link href={`/juz/${juzId}`} variant={LinkVariant.Primary} prefetch={false}>
              <div className={styles.juzTitle}>
                {t('juz')} {toLocalizedNumber(juzId, lang)}
              </div>
            </Link>
            {chapterIds.map((chapterId) => {
              const chapter = getChapterData(chaptersData, chapterId);
              return (
                <div className={styles.chapterContainer} key={chapterId}>
                  <Link
                    href={`/${chapterId}/${chapterAndVerseMappings[chapterId]}`}
                    prefetch={false}
                  >
                    <SurahPreviewRow
                      chapterId={Number(chapterId)}
                      description={`${toLocalizedNumber(chapter.versesCount, lang)} ${t('ayahs')}`}
                      surahName={chapter.transliteratedName}
                      surahNumber={Number(chapterId)}
                      translatedSurahName={chapter.translatedName as string}
                      isMinimalLayout={shouldUseMinimalLayout(lang)}
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
