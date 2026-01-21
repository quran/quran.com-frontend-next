import React, { useMemo, useCallback } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import styles from './StudyModeAnswersTab.module.scss';
import StudyModeTabLayout, { useStudyModeTabScroll } from './StudyModeTabLayout';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import Select from '@/dls/Forms/Select';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import useQuestionsPagination from '@/hooks/useQuestionsPagination';
import { selectQnaLanguage, setQnaLanguage } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Language from '@/types/Language';
import { logValueChange } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import { makeVerseKey } from '@/utils/verse';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const QuestionsList = dynamic(() => import('@/components/QuestionAndAnswer/QuestionsList'), {
  ssr: false,
  loading: () => <TafsirSkeleton />,
});

interface StudyModeAnswersTabProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeAnswersTab: React.FC<StudyModeAnswersTabProps> = ({ chapterId, verseNumber }) => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const storedLanguage = useSelector(selectQnaLanguage);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  const {
    actions: { onSettingsChange },
  } = usePersistPreferenceGroup();

  // Use stored language preference or fall back to current locale
  const selectedLanguage = useMemo(
    () => storedLanguage || (lang as Language) || Language.EN,
    [storedLanguage, lang],
  );

  const verseKey = makeVerseKey(Number(chapterId), Number(verseNumber));

  const { questions, hasMore, isLoadingMore, loadMore, isLoading } = useQuestionsPagination({
    verseKey,
    language: selectedLanguage as Language,
  });

  const onLanguageChange = useCallback(
    (value: string) => {
      const newLanguage = value as Language;
      logValueChange('qna_language', selectedLanguage, newLanguage);

      // Persist to user preferences (syncs with backend if logged in)
      onSettingsChange(
        'selectedQnaLanguage',
        newLanguage,
        setQnaLanguage(newLanguage),
        setQnaLanguage(selectedLanguage),
        PreferenceGroup.READING,
      );

      dispatch(setQnaLanguage(newLanguage));
      scrollToTop();
    },
    [dispatch, onSettingsChange, selectedLanguage, scrollToTop],
  );

  const languageOptions = useMemo(
    () =>
      Object.values(Language).map((l) => ({
        label: getLocaleName(l),
        value: l,
      })),
    [],
  );

  const renderBody = () => {
    if (isLoading) return <TafsirSkeleton />;

    if (!questions || questions.length === 0) {
      return (
        <div className={styles.notAvailableMessage}>
          {t('quran-reader:questions-not-available')}
        </div>
      );
    }

    return (
      <div
        className={classNames(
          styles.answersContainer,
          styles[`qna-font-size-${quranReaderStyles.qnaFontScale}`],
        )}
      >
        <QuestionsList
          questions={questions}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <StudyModeTabLayout
        fontType="qna"
        selectionControl={
          <div className={styles.languageSelectContainer}>
            <Select
              id="qna-language"
              name="qna-language"
              options={languageOptions}
              value={selectedLanguage}
              onChange={onLanguageChange}
            />
          </div>
        }
        body={renderBody()}
      />
    </div>
  );
};

export default StudyModeAnswersTab;
