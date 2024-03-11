import React from 'react';

import styles from './CollapsibleTitle.module.scss';

import IconContainer from '@/dls/IconContainer/IconContainer';

type Props = {
  title: string;
  icon: React.ReactNode;
};

const CollapsibleTitle: React.FC<Props> = ({ title, icon }) => {
  return (
    <div className={styles.container}>
      <IconContainer
        className={styles.iconContainer}
        shouldForceSetColors={false}
        icon={icon}
        shouldFlipOnRTL={false}
      />
      {title}
    </div>
  );
};

export default CollapsibleTitle;
