import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconClose from '@/icons/close.svg';
import { TestId } from '@/tests/test-ids';

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
      data-testid={TestId.NAVIGATION_DRAWER_CLOSE_BUTTON}
    >
      <IconClose />
    </Button>
  );
};

export default DrawerCloseButton;
