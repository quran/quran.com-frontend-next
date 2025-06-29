import React, { useRef } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate } from '@/utils/navigation';

interface BottomActionsModalsProps {
  chapterId: string;
  verseNumber: string;
  verseKey: string;
  tafsirs: string[];
  isTafsirModalOpen: boolean;
  isReflectionModalOpen: boolean;
  isQuestionsModalOpen: boolean;
  hasQuestions: boolean;
  isTranslationView: boolean;
  setIsTafsirModalOpen: (isOpen: boolean) => void;
  setIsReflectionModalOpen: (isOpen: boolean) => void;
  setIsQuestionsModalOpen: (isOpen: boolean) => void;
}

const BottomActionsModals: React.FC<BottomActionsModalsProps> = ({
  chapterId,
  verseNumber,
  verseKey,
  tafsirs,
  isTafsirModalOpen,
  isReflectionModalOpen,
  isQuestionsModalOpen,
  hasQuestions,
  isTranslationView,
  setIsTafsirModalOpen,
  setIsReflectionModalOpen,
  setIsQuestionsModalOpen,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  // Refs for content modals
  const tafsirModalRef = useRef(null);
  const reflectionModalRef = useRef(null);

  // Modal close handlers
  const onTafsirModalClose = () => {
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_tafsir_modal_close`);
    setIsTafsirModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
  };

  const onReflectionModalClose = () => {
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_reflection_modal_close`);
    setIsReflectionModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
  };

  const onQuestionsModalClose = () => {
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_questions_modal_close`);
    setIsQuestionsModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
  };

  const onQuestionsModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      {/* Tafsir Modal */}
      <TafsirBody
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialTafsirIdOrSlug={tafsirs[0]}
        scrollToTop={() => {
          tafsirModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, languageAndTafsirSelection, body }) => (
          <ContentModal
            innerRef={tafsirModalRef}
            isOpen={isTafsirModalOpen}
            onClose={onTafsirModalClose}
            header={t('quran-reader:tafsirs')}
          >
            {surahAndAyahSelection}
            {languageAndTafsirSelection}
            {body}
          </ContentModal>
        )}
      />

      {/* Reflection Modal */}
      <ReflectionBodyContainer
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        scrollToTop={() => {
          reflectionModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={reflectionModalRef}
            isOpen={isReflectionModalOpen}
            onClose={onReflectionModalClose}
            header={t('reflections-and-lessons')}
          >
            {surahAndAyahSelection}
            {body}
          </ContentModal>
        )}
      />

      {/* Questions Modal */}
      {isQuestionsModalOpen && hasQuestions && (
        <QuestionsModal
          isOpen
          onClose={onQuestionsModalClose}
          verseKey={verseKey}
          onModalClick={onQuestionsModalClick}
        />
      )}
    </>
  );
};

export default BottomActionsModals;
