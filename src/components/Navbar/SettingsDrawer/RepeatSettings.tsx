import Trans from 'next-translate/Trans';

import RepeatIcon from '../../../../public/icons/repeat.svg';

import styles from './RepeatSettings.module.scss';

import IconContainer, { IconSize } from 'src/components/dls/IconContainer/IconContainer';

const RepeatSettings = () => {
  return (
    <div>
      <Trans
        i18nKey="common:audio.repeat-moved"
        components={[
          <span className={styles.iconContainer}>
            <IconContainer size={IconSize.Small} key="repeat-icon" icon={<RepeatIcon />} />
          </span>,
        ]}
      />
      {/* The repeat settings have moved to the audio player. Click on the <RepeatIcon /> to access them */}
    </div>
  );
};

export default RepeatSettings;
