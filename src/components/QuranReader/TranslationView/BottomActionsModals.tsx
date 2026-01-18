import React from 'react';

import { useRouter } from 'next/router';

import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import { logEvent } from '@/utils/eventLogger';
import { fakeNavigate } from '@/utils/navigation';

/**
 * Enum for modal types - now only contains QUESTIONS
 * Tafsir, Reflections, and Lessons are handled by StudyModeModal
 */
export enum ModalType {
  QUESTIONS = 'questions',
}

interface BottomActionsModalsProps {
  verseKey: string;
  openedModal: ModalType | null;
  hasQuestions: boolean;
  isTranslationView: boolean;
  onCloseModal: () => void;
}

const BottomActionsModals: React.FC<BottomActionsModalsProps> = ({
  verseKey,
  openedModal,
  hasQuestions,
  isTranslationView,
  onCloseModal,
}) => {
  const router = useRouter();

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
