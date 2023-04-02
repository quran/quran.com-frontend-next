import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AudioExperienceMenu.module.scss';

import { WordByWordType } from '@/types/QuranReader';

type Props = {
  showTooltipFor?: WordByWordType[];
};

const ContentTypeMessage: React.FC<Props> = ({ showTooltipFor }) => {
  const { t } = useTranslation('common');
  if (!!showTooltipFor && !!showTooltipFor.length) {
    return (
      <p className={styles.tooltipText}>
        {`${t('audio.displaying')}: `}
        {showTooltipFor?.map((tooltipTextType, index) => (
          <span key={tooltipTextType}>
            {t(tooltipTextType)}
            {`${index === 0 && showTooltipFor.length > 1 ? ' • ' : ''}`}
          </span>
        ))}
      </p>
    );
  }
  return <></>;
};

export default ContentTypeMessage;
