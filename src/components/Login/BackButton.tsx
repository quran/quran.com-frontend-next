import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import ArrowLeft from '@/icons/west.svg';

interface Props {
  onClick: () => void;
  label?: string;
}

const BackButton: FC<Props> = ({ onClick, label }) => {
  const { t } = useTranslation('common');

  return (
    <Button
      onClick={onClick}
      className={styles.backButton}
      prefix={<ArrowLeft />}
      type={ButtonType.Inverse}
      variant={ButtonVariant.Ghost}
    >
      {label || t('back')}
    </Button>
  );
};

export default BackButton;
