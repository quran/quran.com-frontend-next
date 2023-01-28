import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import { useSelector } from 'react-redux';

import styles from './AudioExperienceMenu.module.scss';
import ContentTypeMessage from './ContentTypeMessage';

import { selectIsTooltipContentEnabled } from '@/redux/slices/QuranReader/readingPreferences';
import { WordByWordType } from '@/types/QuranReader';

type Props = {
  onSettingsClicked: () => void;
  showTooltipFor?: WordByWordType[];
};

const HelpText: React.FC<Props> = ({ onSettingsClicked, showTooltipFor }) => {
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
            settingsLink: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <span
                key={3}
                onKeyPress={onSettingsClicked}
                tabIndex={0}
                role="button"
                onClick={onSettingsClicked}
                className={classNames(styles.bold, styles.link)}
              />
            ),
          }}
        />
      </div>
    </>
  );
};

export default HelpText;
