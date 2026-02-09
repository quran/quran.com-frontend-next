import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeLayersTab.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';

interface GroupTokenProps {
  isActive: boolean;
  selectedOptionHtml: string;
  onClick: () => void;
}

const GroupToken: React.FC<GroupTokenProps> = ({ isActive, selectedOptionHtml, onClick }) => {
  const { t } = useTranslation('quran-reader');

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={t('layers.alternative-translations')}
      className={classNames(styles.groupToken, { [styles.groupTokenActive]: isActive })}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick();
        }
      }}
    >
      <span
        className={styles.groupTokenText}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: selectedOptionHtml }}
      />

      <ChevronDownIcon className={styles.groupTokenChevron} />
    </span>
  );
};

export default GroupToken;
