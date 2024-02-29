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
import { privateFetcher } from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  noteId?: string;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
  onClose,
  isOpen,
  verseKey,
  noteId,
  onNoteUpdated,
  onNoteDeleted,
}) => {
  const contentModalRef = useRef<ContentModalHandles>();

  const queryKey = noteId ? makeGetNoteByIdUrl(noteId) : makeGetNotesByVerseUrl(verseKey);

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
    >
      <DataFetcher
        queryKey={queryKey}
        fetcher={privateFetcher}
        showSpinnerOnRevalidate={false}
        render={(response: (Note | Note[]) & BaseResponse) => {
          const note = noteId ? (response as Note) : (response[0] as Note);
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
