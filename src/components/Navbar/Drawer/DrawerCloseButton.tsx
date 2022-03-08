import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import { CloseIcon } from 'src/components/Icons';

interface Props {
  onClick: () => void;
}

const DrawerCloseButton: React.FC<Props> = ({ onClick }) => {
  const { t } = useTranslation('common');
  return (
    <Button
      tooltip={t('close')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      onClick={onClick}
    >
      <CloseIcon />
    </Button>
  );
};

export default DrawerCloseButton;
