import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import { FiX } from 'react-icons/fi';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';

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
      ariaLabel={t('aria.drawer-close')}
    >
      <FiX />
    </Button>
  );
};

export default DrawerCloseButton;
