import React, { useRef } from 'react';

import Editor from '@/components/Notes/Editor';
import Button, { ButtonType } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const VerseNotesModal: React.FC<Props> = ({ onClose, isOpen }) => {
  const contentModalRef = useRef<ContentModalHandles>();
  const editorRef = useRef(null);

  const onSaveClicked = () => {
    console.log(editorRef.current.toJSON());
  };
  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<>Notes</>}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      <Editor ref={editorRef} />
      <Button type={ButtonType.Primary} onClick={onSaveClicked}>
        Save
      </Button>
    </ContentModal>
  );
};

export default VerseNotesModal;
