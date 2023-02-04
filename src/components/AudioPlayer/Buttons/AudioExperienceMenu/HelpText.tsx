import React from 'react';

import Trans from 'next-translate/Trans';
import { useSelector } from 'react-redux';

import styles from './AudioExperienceMenu.module.scss';
import ContentTypeMessage from './ContentTypeMessage';

import { selectIsTooltipContentEnabled } from '@/redux/slices/QuranReader/readingPreferences';
import { WordByWordType } from '@/types/QuranReader';

type Props = {
  showTooltipFor?: WordByWordType[];
};

const HelpText: React.FC<Props> = ({ showTooltipFor }) => {
  const isTooltipContentEnabled = useSelector(selectIsTooltipContentEnabled);
  return (
    <>
      {isTooltipContentEnabled && <ContentTypeMessage showTooltipFor={showTooltipFor} />}
      <div className={styles.helpText}>
        <Trans
          i18nKey={`${
            isTooltipContentEnabled ? 'common:audio.exp-tip' : 'common:audio.exp-tip-no-select'
          }`}
          components={{
            span: <span key={0} />,
            br: <br key={1} />,
            boldSpan: <span key={2} className={styles.bold} />,
          }}
        />
      </div>
    </>
  );
};

export default HelpText;
