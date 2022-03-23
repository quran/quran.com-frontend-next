import useTranslation from 'next-translate/useTranslation';

import DiscordIcon from '../../../../public/icons/discord-icon.svg';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import Link from 'src/components/dls/Link/Link';

const CommunitySection = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div className={styles.platformLogoBackground}>
        <DiscordIcon />
      </div>
      <div className={styles.flow}>
        <div className={styles.title}>{t('community.header')}</div>
        <div>{t('community.sub-header')}</div>
        <Link href="https://discord.gg/FxRWSBfWxn" isNewTab className={styles.joinCommunityLink}>
          <Button href="" type={ButtonType.Success}>
            {t('community.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySection;
