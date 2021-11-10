import { useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Link, { LinkVariant } from '../dls/Link/Link';
import SurahPreviewRow from '../dls/SurahPreview/SurahPreviewRow';

import styles from './JuzView.module.scss';

import { getAllJuzMappings, getChapterData } from 'src/utils/chapter';
import { isMinimalLayoutLocale } from 'src/utils/locale';

type JuzViewProps = {
  isDescending: boolean;
};

const JuzView = ({ isDescending }: JuzViewProps) => {
  const { t, lang } = useTranslation('common');
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
              <div className={styles.juzTitle}>
                {t('juz')} {juzId}
              </div>
            </Link>
            {chapterIds.map((chapterId) => {
              const chapter = getChapterData(chapterId, lang);
              return (
                <div className={styles.chapterContainer} key={chapterId}>
                  <Link href={`/${chapterId}/${chapterAndVerseMappings[chapterId]}`}>
                    <SurahPreviewRow
                      chapterId={Number(chapterId)}
                      description={`${chapter.versesCount} ${t('ayahs')}`}
                      surahName={chapter.transliteratedName}
                      surahNumber={Number(chapterId)}
                      translatedSurahName={chapter.translatedName as string}
                      isMinimalLayout={isMinimalLayoutLocale(lang)}
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
