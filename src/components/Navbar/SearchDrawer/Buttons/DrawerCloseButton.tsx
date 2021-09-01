import React from 'react';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import IconClose from '../../../../../public/icons/close.svg';

interface Props {
  onClick: () => void;
}

const DrawerCloseButton: React.FC<Props> = ({ onClick }) => (
  <Button
    tooltip="close"
    shape={ButtonShape.Circle}
    variant={ButtonVariant.Ghost}
    onClick={onClick}
  >
    <IconClose />
  </Button>
);

export default DrawerCloseButton;
