import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import ArrowLeft from '@/icons/west.svg';

interface Props {
  onClick: () => void;
  label?: string;
}

const BackButton: FC<Props> = ({ onClick, label }) => {
  const { t } = useTranslation('common');

  return (
    <button type="button" onClick={onClick} className={styles.backButton}>
      <ArrowLeft />
      <p>{label || t('back')}</p>
    </button>
  );
};

export default BackButton;
