import React from 'react';

import styles from './Feature.module.scss';

import IconContainer from '@/dls/IconContainer/IconContainer';

type Props = {
  text: string | React.ReactNode;
  icon: React.ReactNode;
};

const Feature: React.FC<Props> = ({ text, icon }) => {
  return (
    <div className={styles.container}>
      <IconContainer shouldForceSetColors={false} icon={icon} shouldFlipOnRTL={false} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Feature;
