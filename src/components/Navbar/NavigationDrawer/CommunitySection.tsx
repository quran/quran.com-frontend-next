import useTranslation from 'next-translate/useTranslation';

import DiscordIcon from '../../../../public/icons/discord-icon.svg';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from 'src/components/dls/IconContainer/IconContainer';
import Link from 'src/components/dls/Link/Link';

const CommunitySection = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div className={styles.platformLogoBackground}>
        <DiscordIcon />
      </div>
      <div className={styles.platformLogo}>
        <IconContainer icon={<DiscordIcon />} size={IconSize.Xsmall} color={IconColor.secondary} />
      </div>
      <div className={styles.flow}>
        <div className={styles.title}>{t('community.header')}</div>
        <div>{t('community.sub-header')}</div>
        <Link href="https://discord.gg/FxRWSBfWxn" newTab className={styles.noUnderline}>
          <Button href="" type={ButtonType.Success}>
            {t('community.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySection;
