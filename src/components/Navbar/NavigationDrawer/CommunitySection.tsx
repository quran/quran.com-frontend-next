import DiscordIconBlackWhite from '../../../../public/icons/discord-icon-black-white.svg';
import DiscordIconColor from '../../../../public/icons/discord-icon-color.svg';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import { DISCORD_URL } from 'src/constants';

const CommunitySection = () => {
  return (
    <div className={styles.container}>
      <div className={styles.platformLogoBackground}>
        <DiscordIconColor />
      </div>
      <div className={styles.platformLogo}>
        <IconContainer
          icon={<DiscordIconBlackWhite />}
          size={IconSize.Xsmall}
          color={IconColor.secondary}
        />
      </div>
      <div className={styles.flow}>
        <div className={styles.title}>
          Join the QDC Community of Muslim builders and technologists.{' '}
        </div>
        <div>
          Sign up for the Quran.com Discord to particpate and collaborate with the leading community
          building Islamic tech.
        </div>
        <Button href={DISCORD_URL} type={ButtonType.Success}>
          Join Community
        </Button>
      </div>
    </div>
  );
};

export default CommunitySection;
