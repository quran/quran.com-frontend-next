import React, { MouseEvent } from 'react';

import CloseIcon from '../../../../public/icons/close.svg';

import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import KeyboardInput from 'src/components/dls/KeyboardInput';

interface Props {
  isClearable: boolean;
  isSelected: boolean;
  commandKey: number | string;
  onRemoveItemClicked: (event: MouseEvent<Element>, key: number | string) => void;
}

const ItemControl: React.FC<Props> = ({
  isClearable,
  onRemoveItemClicked,
  commandKey,
  isSelected,
}) => {
  if (isClearable) {
    return (
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        onClick={(e) => onRemoveItemClicked(e, commandKey)}
      >
        <CloseIcon />
      </Button>
    );
  }
  if (isSelected) {
    return <KeyboardInput keyboardKey="enter" />;
  }
  return null;
};

export default ItemControl;
