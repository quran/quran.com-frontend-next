import React from 'react';

import classNames from 'classnames';

import styles from '../FloatingMenu.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';

type Props = {
  isActive: boolean;
  onClick: () => void;
  text: string;
};
const FloatingMenuItem: React.FC<Props> = ({ isActive, onClick, text }) => {
  return (
    <Button
      type={ButtonType.Secondary}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      onClick={onClick}
      className={classNames({
        [styles.isActive]: isActive,
      })}
    >
      {text}
    </Button>
  );
};

export default FloatingMenuItem;
