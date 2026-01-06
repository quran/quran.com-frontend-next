/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useRef } from 'react';

import isArray from 'lodash/isArray';

import EditNoteMode from './EditNoteMode';
import NewNoteMode from './NewNoteMode';
import styles from './NoteModal.module.scss';

import DataFetcher from '@/components/DataFetcher';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import { BaseResponse } from '@/types/ApiResponses';
import { Note } from '@/types/auth/Note';
import { getNotesByVerse, getNoteById } from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  noteId?: string;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
  isBottomSheetOnMobile?: boolean;
  isOverlayMax?: boolean;
}

const NoteModal: React.FC<NoteModalProps> = ({
  onClose,
  isOpen,
  verseKey,
  noteId,
  onNoteUpdated,
  onNoteDeleted,
  isBottomSheetOnMobile = false,
  isOverlayMax = false,
}) => {
  const contentModalRef = useRef<ContentModalHandles>();

  const queryKey = noteId ? makeGetNoteByIdUrl(noteId) : makeGetNotesByVerseUrl(verseKey);
  const customFetcher = async (): Promise<BaseResponse> => {
    try {
      if (noteId) {
        const data = await getNoteById(noteId);
        return data as any; // Cast to match expected interface
      }
      const data = await getNotesByVerse(verseKey);
      return data as any; // Cast to match expected interface
    } catch (error) {
      return { error: error.message } as BaseResponse;
    }
  };

  const deleteAndClose = () => {
    onNoteDeleted();
    onClose();
  };

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<div className={styles.headerContainer} />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
      isBottomSheetOnMobile={isBottomSheetOnMobile}
      isOverlayMax={isOverlayMax}
    >
      <DataFetcher
        queryKey={queryKey}
        fetcher={customFetcher}
        showSpinnerOnRevalidate={false}
        render={(response: (Note | Note[]) & BaseResponse) => {
          // Check for error first
          if ((response as BaseResponse).error) {
            return <NewNoteMode verseKey={verseKey} />;
          }

          const note = noteId ? (response as Note) : (response as Note[])[0];
          if (note) {
            return (
              <EditNoteMode
                onNoteUpdated={onNoteUpdated}
                onNoteDeleted={onNoteDeleted ? deleteAndClose : undefined}
                verseKey={verseKey}
                notes={isArray(response) ? response : [response]}
                noteId={noteId}
              />
            );
          }
          return <NewNoteMode verseKey={verseKey} />;
        }}
      />
    </ContentModal>
  );
};

export default NoteModal;
