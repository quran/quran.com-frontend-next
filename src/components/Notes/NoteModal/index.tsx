import React, { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import NoteModalHeader from './Header';
import styles from './NoteModal.module.scss';

import NotesEditor from '@/components/Notes/Editor';
import Button, { ButtonType } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import NoteType from '@/types/NoteType';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type?: NoteType;
  typeMetadata?: { identifier: string } & Record<string, any>;
};

const NoteModal: React.FC<Props> = ({ onClose, isOpen, type, typeMetadata }) => {
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSaveClicked = () => {
    logButtonClick('save_note');
    const JSONContent = editorRef.current.getJSON();
    console.log(JSON.stringify(JSONContent));
    console.log(editorRef.current.getHTML());
    console.log(editorRef.current.getMarkDown());
    // if (JSONContent) {
    //   // TODO: save to remove DB
    //   console.log(type, typeMetadata, JSONContent);
    // }
  };
  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<NoteModalHeader />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      <NotesEditor ref={editorRef} />
      <div className={styles.buttonContainer}>
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          type={ButtonType.Primary}
          onClick={onSaveClicked}
        >
          {t('notes.save')}
        </Button>
      </div>
    </ContentModal>
  );
};

export default NoteModal;
