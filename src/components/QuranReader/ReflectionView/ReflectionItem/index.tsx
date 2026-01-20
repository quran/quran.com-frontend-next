/* eslint-disable max-lines */
import { useCallback, useContext, useMemo, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import AuthorInfo from './AuthorInfo';
import HeaderMenu from './HeaderMenu';
import styles from './ReflectionItem.module.scss';
import SocialInteraction from './SocialInteraction';

import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import DataContext from '@/contexts/DataContext';
import useIntersectionObserver from '@/hooks/useObserveElement';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import truncate, { getVisibleTextLength } from '@/utils/html-truncate';
import { toLocalizedNumber } from '@/utils/locale';
import { parseReflectionBody } from '@/utils/quranReflect/bodyParser';
import { isRTLReflection } from '@/utils/quranReflect/locale';
import { getReflectionGroupLink } from '@/utils/quranReflect/navigation';
import {
  MAX_REFLECTION_LENGTH,
  getInitialVisiblePostPercentage,
  estimateReadingTimeOfInitialVisiblePortion,
} from '@/utils/quranReflect/views';
import { makeVerseKey } from '@/utils/verse';
import AyahReflection from 'types/QuranReflect/AyahReflection';

type Props = {
  reflection: AyahReflection;
  selectedChapterId: string;
  selectedVerseNumber: string;
};

const ReflectionItem: React.FC<Props> = ({
  reflection,
  selectedChapterId,
  selectedVerseNumber,
}) => {
  const { id, createdAt, author, estimatedReadingTime } = reflection;
  const reflectionText = reflection?.body;
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, lang } = useTranslation();
  const [shouldShowReferredVerses, setShouldShowReferredVerses] = useState(false);
  const chaptersData = useContext(DataContext);
  const reflectionBodyRef = useRef(null);
  useIntersectionObserver(reflectionBodyRef, REFLECTIONS_OBSERVER_ID);

  const onReferredVersesHeaderClicked = () => {
    setShouldShowReferredVerses((prevShouldShowReferredVerses) => {
      logButtonClick(
        // eslint-disable-next-line i18next/no-literal-string
        `reflection_item_reference_${prevShouldShowReferredVerses ? 'close' : 'open'}`,
      );
      return !prevShouldShowReferredVerses;
    });
  };

  const onMoreLessClicked = () => {
    setIsExpanded((prevIsExpanded) => {
      // eslint-disable-next-line i18next/no-literal-string
      logButtonClick(`reflection_item_show_${prevIsExpanded ? 'less' : 'more'}`);
      return !prevIsExpanded;
    });
  };

  // some reference, are referencing to the entire chapter (doesn't have from/to properties)
  // we only want to show the data for references that have from/to properties
  const nonChapterVerseReferences = useMemo(
    () => reflection.references.filter((verse) => !!verse.from && !!verse.to),
    [reflection.references],
  );

  const getSurahName = useCallback(
    (chapterNumber: number) => {
      const surahName = getChapterData(chaptersData, chapterNumber.toString())?.transliteratedName;
      return `${t('common:surah')} ${surahName} (${toLocalizedNumber(chapterNumber, lang)})`;
    },
    [chaptersData, lang, t],
  );

  const reflectionTextLength = useMemo(() => {
    return reflectionText?.length;
  }, [reflectionText?.length]);
  const estimatedReadingTimeOfInitialVisiblePortion = useMemo(() => {
    return estimateReadingTimeOfInitialVisiblePortion(
      getInitialVisiblePostPercentage(reflectionTextLength),
      estimatedReadingTime,
    );
  }, [estimatedReadingTime, reflectionTextLength]);

  const formattedText = useMemo(
    () => parseReflectionBody(reflectionText, styles.hashtag),
    [reflectionText],
  );

  const visibleTextLength = getVisibleTextLength(formattedText);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AuthorInfo
          authorUsername={author?.username}
          authorName={`${author?.firstName} ${author?.lastName}`}
          avatarUrl={author?.avatarUrls?.small}
          date={createdAt}
          isAuthorVerified={reflection?.author?.verified}
          reflectionGroup={reflection?.room?.name}
          reflectionGroupLink={getReflectionGroupLink(reflection?.room)}
          verseReferences={reflection.references}
          nonChapterVerseReferences={nonChapterVerseReferences}
          onReferredVersesHeaderClicked={onReferredVersesHeaderClicked}
          shouldShowReferredVerses={shouldShowReferredVerses}
        />
        <HeaderMenu
          postId={id}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
        />
      </div>
      {shouldShowReferredVerses && nonChapterVerseReferences?.length > 0 && (
        <div className={styles.verseAndTranslationsListContainer}>
          {nonChapterVerseReferences.map(({ chapterId: chapter, from, to }) => (
            <div
              className={styles.verseAndTranslationContainer}
              key={makeVerseKey(chapter, from, to)}
            >
              {reflection.references.length > 1 && (
                <span className={styles.surahName}>{getSurahName(chapter)}</span>
              )}
              <VerseAndTranslation chapter={chapter} from={from} to={to} />
            </div>
          ))}
        </div>
      )}
      <div
        ref={reflectionBodyRef}
        data-post-id={id}
        data-count-as-viewed-after={estimatedReadingTimeOfInitialVisiblePortion}
        className={isRTLReflection(reflection.languageId) ? styles.rtl : styles.ltr}
      >
        <p className="debugger" />
        <span
          className={styles.body}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: isExpanded ? formattedText : truncate(formattedText, MAX_REFLECTION_LENGTH),
          }}
        />
        {visibleTextLength > MAX_REFLECTION_LENGTH && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <span
            className={styles.moreOrLessText}
            tabIndex={0}
            role="button"
            onClick={onMoreLessClicked}
          >
            {isExpanded ? t('quran-reader:see-less') : t('quran-reader:see-more')}
          </span>
        )}
      </div>
      <SocialInteraction
        references={reflection.references}
        reflectionText={reflectionText}
        likesCount={reflection?.likesCount}
        commentsCount={reflection?.commentsCount}
        postId={id}
      />
    </div>
  );
};

export default ReflectionItem;
