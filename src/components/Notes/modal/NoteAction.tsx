import React, { useCallback, useContext } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import useBatchedCountRangeNotes from '@/hooks/auth/useBatchedCountRangeNotes';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openNotesModal, VerseActionModalType } from '@/redux/slices/QuranReader/verseActionModal';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

interface NoteActionControllerProps {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;

  /**
   * Indicates whether the current verse has notes.
   *
   * - `true`  → Notes are known to exist.
   * - `false` → Notes are known not to exist.
   * - `undefined` → The notes state is unknown (caller does not have access to note evaluation),
   *   so the component will internally fetch the notes count to determine it.
   */
  hasNotes?: boolean;

  /**
   * Render prop for the action trigger
   * @param {object} params - Component props
   * @param {() => void} params.onClick - The function to be called when the action is triggered
   * @param {boolean} params.hasNote - Indicates whether the current verse has notes
   * @returns {React.ReactNode} JSX element containing the action trigger
   */
  children: (params: { onClick: () => void; hasNote: boolean }) => React.ReactNode;
}

const NoteActionController: React.FC<NoteActionControllerProps> = ({
  verseKey,
  hasNotes: hasNotesProp,
  onActionTriggered,
  isTranslationView,
  children,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const audioService = useContext(AudioPlayerMachineContext);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

  const { data: notesCount } = useBatchedCountRangeNotes(
    hasNotesProp === undefined ? verseKey : null,
  );

  const logNoteEvent = useCallback(
    (event: string) => {
      logEvent(isTranslationView ? `translation_view_${event}` : `reading_view_${event}`);
    },
    [isTranslationView],
  );

  const handleTriggerClick = useCallback(() => {
    if (!isLoggedIn()) {
      audioService.send({ type: 'CLOSE' });
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verseKey)));
      logNoteEvent('note_redirect_to_login');
      return;
    }

    // Dispatch Redux action to open notes modal
    dispatch(
      openNotesModal({
        modalType: VerseActionModalType.ADD_NOTE,
        verseKey,
        wasOpenedFromStudyMode: isStudyModeOpen,
        studyModeRestoreState:
          isStudyModeOpen && studyModeVerseKey
            ? {
                verseKey: studyModeVerseKey,
                activeTab: studyModeActiveTab,
                highlightedWordLocation: studyModeHighlightedWordLocation,
                isSsrMode,
              }
            : undefined,
      }),
    );

    logNoteEvent('open_add_note_modal');

    // Trigger action callback if provided (e.g., to close popover)
    if (onActionTriggered) {
      onActionTriggered();
    }
  }, [
    audioService,
    router,
    verseKey,
    logNoteEvent,
    isStudyModeOpen,
    isSsrMode,
    studyModeVerseKey,
    studyModeActiveTab,
    studyModeHighlightedWordLocation,
    dispatch,
    onActionTriggered,
  ]);

  const hasNote = hasNotesProp ?? (notesCount && notesCount > 0);

  return <>{children({ onClick: handleTriggerClick, hasNote })}</>;
};

export default NoteActionController;
