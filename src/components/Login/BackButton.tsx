import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './login.module.scss';

import ArrowLeft from '@/icons/west.svg';
import { Direction } from '@/utils/locale';

interface Props {
  onClick: () => void;
  label?: string;
}

const BackButton: FC<Props> = ({ onClick, label }) => {
  const { t } = useTranslation('common');

  return (
    <button dir={Direction.LTR} type="button" onClick={onClick} className={styles.backButton}>
      <ArrowLeft />
      <p dir={Direction.RTL}>{label || t('back')}</p>
    </button>
  );
};

export default BackButton;
