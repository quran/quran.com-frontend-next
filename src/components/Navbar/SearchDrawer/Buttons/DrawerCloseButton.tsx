import React from 'react';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import IconClose from '../../../../../public/icons/close.svg';

interface Props {
  onClick: () => void;
}

const DrawerCloseButton: React.FC<Props> = ({ onClick }) => (
  <Button
    shape={ButtonShape.Circle}
    variant={ButtonVariant.Ghost}
    size={ButtonSize.Small}
    onClick={onClick}
  >
    <IconClose />
  </Button>
);

export default DrawerCloseButton;
