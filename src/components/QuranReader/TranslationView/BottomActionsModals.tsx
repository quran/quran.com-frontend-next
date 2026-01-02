import React, { useRef } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate } from '@/utils/navigation';
import ContentType from 'types/QuranReflect/ContentType';

/**
 * Enum for modal types
 */
export enum ModalType {
  TAFSIR = 'tafsir',
  REFLECTION = 'reflection',
  LESSON = 'lesson',
  QUESTIONS = 'questions',
}

interface BottomActionsModalsProps {
  chapterId: string;
  verseNumber: string;
  verseKey: string;
  tafsirs: string[];
  openedModal: ModalType | null;
  hasQuestions: boolean;
  isTranslationView: boolean;
  onCloseModal: () => void;
}

const BottomActionsModals: React.FC<BottomActionsModalsProps> = ({
  chapterId,
  verseNumber,
  verseKey,
  tafsirs,
  openedModal,
  hasQuestions,
  isTranslationView,
  onCloseModal,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  // Refs for content modals
  const tafsirModalRef = useRef(null);
  const reflectionModalRef = useRef(null);
  const lessonModalRef = useRef(null);

  // Modal close handlers
  const handleModalClose = (modalType: ModalType) => {
    logEvent(`${isTranslationView ? 'translation_view' : 'reading_view'}_${modalType}_modal_close`);
    onCloseModal();
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
        shouldRender={openedModal === ModalType.TAFSIR}
        render={({ surahAndAyahSelection, languageAndTafsirSelection, body }) => (
          <ContentModal
            innerRef={tafsirModalRef}
            isOpen={openedModal === ModalType.TAFSIR}
            onClose={() => handleModalClose(ModalType.TAFSIR)}
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
        isModal
        scrollToTop={() => {
          reflectionModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={reflectionModalRef}
            isOpen={openedModal === ModalType.REFLECTION}
            onClose={() => handleModalClose(ModalType.REFLECTION)}
          >
            {surahAndAyahSelection}
            {body}
          </ContentModal>
        )}
      />

      {/* Lesson Modal */}
      <ReflectionBodyContainer
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialContentType={ContentType.LESSONS}
        isModal
        scrollToTop={() => {
          lessonModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={lessonModalRef}
            isOpen={openedModal === ModalType.LESSON}
            onClose={() => handleModalClose(ModalType.LESSON)}
          >
            {surahAndAyahSelection}
            {body}
          </ContentModal>
        )}
      />

      {/* Questions Modal */}
      {openedModal === ModalType.QUESTIONS && hasQuestions && (
        <QuestionsModal
          isOpen
          onClose={() => handleModalClose(ModalType.QUESTIONS)}
          verseKey={verseKey}
          onModalClick={onQuestionsModalClick}
        />
      )}
    </>
  );
};

export default BottomActionsModals;
