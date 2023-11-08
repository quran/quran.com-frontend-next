import React, { useRef, useState } from 'react';

import { editorViewCtx, serializerCtx } from '@milkdown/core';
import { useInstance } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import NoteModalHeader from './Header';
import styles from './NoteModal.module.scss';

import NotesEditor, { NotesEditorRef } from '@/components/Notes/Editor';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInstanceLoading, getInstance] = useInstance();

  const onSaveClicked = () => {
    logButtonClick('save_note');
    const markdown = getInstance().action((ctx) => {
      const editorView = ctx.get(editorViewCtx);
      const serializer = ctx.get(serializerCtx);
      return serializer(editorView.state.doc);
    });
    // TODO: save to DB
    console.log(markdown);
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
      <NotesEditor />
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
