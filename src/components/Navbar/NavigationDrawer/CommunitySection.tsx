import DiscordIcon from '../../../../public/icons/discord-icon-black-white.svg';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { DISCORD_URL } from 'src/constants';

const CommunitySection = () => {
  return (
    <div className={styles.container}>
      <div>
        <DiscordIcon />
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
          Discord Community
        </Button>
      </div>
    </div>
  );
};

export default CommunitySection;
