import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../RenderControls.module.scss';

type Props = {
  data?: { count: number; limit: number };
  isLimitExceeded: boolean;
};

const MonthlyMediaFileCounter: React.FC<Props> = ({ data, isLimitExceeded }) => {
  const { t } = useTranslation('media');

  if (data) {
    return (
      <p
        className={classNames(styles.text, {
          [styles.error]: isLimitExceeded,
        })}
      >
        <span>{t('monthly-balance')}</span>
        <span>{t('count', { count: data?.count })}</span>
        <span>{t('limit', { limit: data?.limit })}</span>
      </p>
    );
  }
  return <></>;
};

export default MonthlyMediaFileCounter;
