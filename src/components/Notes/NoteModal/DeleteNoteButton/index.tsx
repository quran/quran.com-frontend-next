import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';

type Props = {
  onDeleteClicked: () => void;
  isButtonDisabled: boolean;
};

const DeleteNoteButton: React.FC<Props> = ({ onDeleteClicked, isButtonDisabled }) => {
  const { t } = useTranslation('notes');
  return (
    <Button
      type={ButtonType.Secondary}
      size={ButtonSize.Small}
      suffix={<CloseIcon />}
      onClick={onDeleteClicked}
      isDisabled={isButtonDisabled}
      shouldFlipOnRTL={false}
    >
      {t('notes:delete-note')}
    </Button>
  );
};

export default DeleteNoteButton;
