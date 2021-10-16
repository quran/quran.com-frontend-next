import DiscordIcon from '../../../../public/icons/discord-icon.svg';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import Link from 'src/components/dls/Link/Link';

const CommunitySection = () => {
  return (
    <div className={styles.container}>
      <div className={styles.platformLogoBackground}>
        <DiscordIcon />
      </div>
      <div className={styles.platformLogo}>
        <IconContainer icon={<DiscordIcon />} size={IconSize.Xsmall} color={IconColor.secondary} />
      </div>
      <div className={styles.flow}>
        <div className={styles.title}>
          Join the QDC Community of Muslim builders and technologists.{' '}
        </div>
        <div>
          Sign up for the Quran.com Discord to particpate and collaborate with the leading community
          building Islamic tech.
        </div>
        <Link href="https://discord.gg/FxRWSBfWxn" newTab>
          <Button href="" type={ButtonType.Success}>
            Join Community
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySection;
