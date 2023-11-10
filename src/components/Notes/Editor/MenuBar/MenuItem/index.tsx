import React, { ReactNode } from 'react';

import styles from './MenuItem.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  itemKey?: string;
  icon?: ReactNode;
  title?: string;
  action?: () => void;
};

const MenuItem: React.FC<Props> = ({ itemKey, icon, title, action }) => {
  const onButtonClicked = () => {
    logButtonClick(`notes_editor_menu_${itemKey}`);
    action();
  };
  return (
    <Button
      type={ButtonType.Primary}
      variant={ButtonVariant.Compact}
      size={ButtonSize.Small}
      className={styles.menuItem}
      onClick={onButtonClicked}
    >
      {title}
    </Button>
  );
};
export default MenuItem;
