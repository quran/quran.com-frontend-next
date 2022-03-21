import React from 'react';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

import styles from './HomePageMessage.module.scss';

import { CloseIcon } from 'src/components/Icons';

type HomePageMessageProps = {
  title?: string;
  subtitle?: string;
  body?: React.ReactNode;
  onClose?: () => void;
};

const HomePageMessage = ({ title, subtitle, body, onClose }: HomePageMessageProps) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{subtitle}</p>
      {body}
      <div className={styles.closeIcon}>
        <Button
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          onClick={onClose}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

export default HomePageMessage;
