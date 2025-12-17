import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

type CommunitySectionVariant = 'drawer' | 'inline';

type CommunitySectionProps = {
  variant?: CommunitySectionVariant;
};

const CommunitySection = ({ variant = 'drawer' }: CommunitySectionProps) => {
  const { t } = useTranslation('common');

  const onJoinCommunityClicked = () => {
    logButtonClick('navigation_drawer_join_community');
  };

  const content = (
    <div className={styles.flow}>
      <div className={styles.title}>{t('community.header')}</div>
      <div>{t('community.sub-header')}</div>
      <div className={styles.actions}>
        <Link
          href="https://forms.gle/Lb4TFoxkSzjx5XHx6"
          isNewTab
          className={styles.joinCommunityLink}
        >
          <Button href="" type={ButtonType.Success} onClick={onJoinCommunityClicked}>
            {t('community.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (variant === 'inline') return content;

  return <div className={styles.container}>{content}</div>;
};

export default CommunitySection;
