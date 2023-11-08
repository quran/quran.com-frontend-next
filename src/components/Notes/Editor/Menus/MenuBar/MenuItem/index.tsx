import React from 'react';

import classNames from 'classnames';

import styles from './MenuItem.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';

type Props = {
  icon?: string;
  title?: string;
  action?: () => void;
  isActive?: () => boolean;
};

const MenuItem: React.FC<Props> = ({ icon, title, action, isActive = null }) => {
  return (
    <Button
      type={ButtonType.Primary}
      variant={ButtonVariant.Compact}
      size={ButtonSize.Small}
      className={classNames(styles.menuItem, {
        [styles.isActive]: isActive && isActive(),
      })}
      onClick={action}
    >
      {title}
    </Button>
  );
};
export default MenuItem;
