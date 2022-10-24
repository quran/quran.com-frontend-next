import React, { MouseEvent } from 'react';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
// import KeyboardInput from '@/dls/KeyboardInput';

interface Props {
  isClearable: boolean;
  isSelected: boolean;
  commandKey: number | string;
  onRemoveCommandClicked: (event: MouseEvent<Element>, key: number | string) => void;
}

const CommandControl: React.FC<Props> = ({
  isClearable,
  onRemoveCommandClicked,
  commandKey,
  isSelected,
}) => {
  if (isClearable) {
    return (
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        onClick={(e) => onRemoveCommandClicked(e, commandKey)}
      >
        <CloseIcon />
      </Button>
    );
  }
  if (isSelected) {
    // return <KeyboardInput keyboardKey="Enter" />;
    return null;
  }
  return null;
};

export default CommandControl;
