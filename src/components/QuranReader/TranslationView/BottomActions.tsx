import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './TranslationViewCell.module.scss';

import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import StarIcon from '@/icons/star.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseAnswersNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type BottomActionsProps = {
  verseKey: string;
  hasQuestions?: boolean;
};

/**
 * Component that renders the bottom action tabs for a verse
 * including Tafsir, Reflections & Lessons, and Answers
 * @returns {JSX.Element} JSX element containing the bottom action tabs
 */
const BottomActions: React.FC<BottomActionsProps> = ({ verseKey, hasQuestions }) => {
  const { t, lang } = useTranslation('common');
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  const handleTafsirClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isKeyboardEvent(e) && e.key !== 'Enter' && e.key !== ' ') return;

    logButtonClick('translation_view_tafsir_tab');
    fakeNavigate(
      getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
      lang,
    );
  };

  const handleReflectionsClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isKeyboardEvent(e) && e.key !== 'Enter' && e.key !== ' ') return;

    logButtonClick('translation_view_reflections_tab');
    fakeNavigate(getVerseReflectionNavigationUrl(verseKey), lang);
  };

  const handleAnswersClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isKeyboardEvent(e) && e.key !== 'Enter' && e.key !== ' ') return;

    logButtonClick('translation_view_answers_tab');
    fakeNavigate(getVerseAnswersNavigationUrl(verseKey), lang);
  };

  const isKeyboardEvent = (e: React.MouseEvent | React.KeyboardEvent): e is React.KeyboardEvent => {
    return 'key' in e;
  };

  return (
    <div className={styles.bottomActionsContainer}>
      <div className={styles.tabsContainer}>
        <div
          className={styles.tabItem}
          onClick={handleTafsirClick}
          onKeyDown={handleTafsirClick}
          role="button"
          tabIndex={0}
          aria-label={t('quran-reader:tafsirs')}
        >
          <span className={styles.tabIcon}>
            <BookIcon />
          </span>
          <span className={styles.tabLabel}>{t('quran-reader:tafsirs')}</span>
        </div>
        <div
          className={styles.tabItem}
          onClick={handleReflectionsClick}
          onKeyDown={handleReflectionsClick}
          role="button"
          tabIndex={0}
          aria-label={t('reflections-and-lessons')}
        >
          <span className={styles.tabIcon}>
            <ChatIcon />
          </span>
          <span className={styles.tabLabel}>{t('reflections-and-lessons')}</span>
        </div>
        {hasQuestions && (
          <div
            className={styles.tabItem}
            onClick={handleAnswersClick}
            onKeyDown={handleAnswersClick}
            role="button"
            tabIndex={0}
            aria-label={t('answers')}
          >
            <span className={styles.tabIcon}>
              <StarIcon />
            </span>
            <span className={styles.tabLabel}>{t('answers')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomActions;
