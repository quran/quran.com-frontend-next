import { Trans } from 'next-i18next';

import styles from './RepeatSettings.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import RepeatIcon from '@/icons/repeat.svg';

const RepeatSettings = () => {
  return (
    <div>
      <Trans
        i18nKey="common:audio.repeat-moved"
        components={[
          <span className={styles.iconContainer} key="repeat-settings">
            <IconContainer size={IconSize.Small} icon={<RepeatIcon />} />
          </span>,
        ]}
      />
    </div>
  );
};

export default RepeatSettings;
