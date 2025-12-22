import React, { useRef } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ContentModal from '@/components/dls/ContentModal/ContentModal';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';
import { useOverlayModal, OverlayType } from '@/hooks/useOverlayModal';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QueryParam from '@/types/QueryParam';
import { ReadingPreference } from '@/types/QuranReader';
import { logEvent } from '@/utils/eventLogger';

/**
 * Shared overlay modals component for both reading and translation modes.
 * Reads state from URL query params and renders the appropriate modal.
 * Always mounted at QuranReader level to support auto-opening on page refresh.
 *
 * @returns {JSX.Element | null} Overlay modals or null if no overlay param
 */
const BottomActionsModals: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const tafsirs = useSelector(selectSelectedTafsirs);
  const readingPreference = useSelector(selectReadingPreference);

  const { overlay, startingVerse, chapterId: chapterIdParam } = router.query;

  const chapterId = String(chapterIdParam || '1');
  const verseNumber = String(startingVerse || '1');
  const verseKey = `${chapterId}:${verseNumber}`;

  // Always call hooks (required by React)
  const tafsirModal = useOverlayModal({ verseKey, overlayType: OverlayType.TAFSIRS });
  const reflectionModal = useOverlayModal({ verseKey, overlayType: OverlayType.REFLECTIONS });
  const questionsModal = useOverlayModal({ verseKey, overlayType: OverlayType.ANSWERS });

  const tafsirModalRef = useRef(null);
  const reflectionModalRef = useRef(null);

  // Early return after hooks
  if (!overlay || !startingVerse || !chapterIdParam) {
    return null;
  }

  // Determine mode for logging (backward compatibility)
  const isTranslationView = readingPreference !== ReadingPreference.Reading;
  const viewMode = isTranslationView ? 'translation_view' : 'reading_view';

  const handleTafsirClose = () => {
    logEvent(`${viewMode}_tafsir_modal_close`);
    tafsirModal.close();
  };

  const handleReflectionClose = () => {
    logEvent(`${viewMode}_reflection_modal_close`);
    reflectionModal.close();
  };

  const handleQuestionsClose = () => {
    logEvent(`${viewMode}_questions_modal_close`);
    questionsModal.close();
  };

  const onQuestionsModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      {/* Tafsir Modal */}
      {tafsirModal.isOpen && (
        <TafsirBody
          shouldRender
          initialChapterId={chapterId}
          initialVerseNumber={verseNumber}
          initialTafsirIdOrSlug={tafsirs[0] || String(router.query[QueryParam.TAFSIR_ID] || '')}
          scrollToTop={() => {
            tafsirModalRef.current?.scrollToTop();
          }}
          render={({ surahAndAyahSelection, languageAndTafsirSelection, body }) => (
            <ContentModal
              innerRef={tafsirModalRef}
              isOpen
              onClose={handleTafsirClose}
              header={t('quran-reader:tafsirs')}
            >
              {surahAndAyahSelection}
              {languageAndTafsirSelection}
              {body}
            </ContentModal>
          )}
        />
      )}

      {/* Reflection Modal */}
      {reflectionModal.isOpen && (
        <ReflectionBodyContainer
          initialChapterId={chapterId}
          initialVerseNumber={verseNumber}
          isModal
          scrollToTop={() => {
            reflectionModalRef.current?.scrollToTop();
          }}
          render={({ surahAndAyahSelection, body }) => (
            <ContentModal innerRef={reflectionModalRef} isOpen onClose={handleReflectionClose}>
              {surahAndAyahSelection}
              {body}
            </ContentModal>
          )}
        />
      )}

      {/* Questions Modal */}
      {questionsModal.isOpen && (
        <QuestionsModal
          isOpen
          onClose={handleQuestionsClose}
          verseKey={verseKey}
          onModalClick={onQuestionsModalClick}
        />
      )}
    </>
  );
};

export default BottomActionsModals;
