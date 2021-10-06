import React from 'react';

import IconClose from '../../../../public/icons/close.svg';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';

interface Props {
  onClick: () => void;
}

const DrawerCloseButton: React.FC<Props> = ({ onClick }) => (
  <Button
    tooltip="Close"
    shape={ButtonShape.Circle}
    variant={ButtonVariant.Ghost}
    onClick={onClick}
  >
    <IconClose />
  </Button>
);

export default DrawerCloseButton;
