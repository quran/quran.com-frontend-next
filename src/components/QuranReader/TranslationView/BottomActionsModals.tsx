import React, { useRef } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate } from '@/utils/navigation';

/**
 * Enum for modal types
 */
export enum ModalType {
  TAFSIR = 'tafsir',
  REFLECTION = 'reflection',
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
        scrollToTop={() => {
          reflectionModalRef.current?.scrollToTop();
        }}
        render={({ surahAndAyahSelection, body }) => (
          <ContentModal
            innerRef={reflectionModalRef}
            isOpen={openedModal === ModalType.REFLECTION}
            onClose={() => handleModalClose(ModalType.REFLECTION)}
            header={t('reflections-and-lessons')}
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
