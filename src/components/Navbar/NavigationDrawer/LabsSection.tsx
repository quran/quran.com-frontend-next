import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

type LabsSectionVariant = 'drawer' | 'inline';

type LabsSectionProps = {
  variant?: LabsSectionVariant;
};

const LabsSection = ({ variant = 'drawer' }: LabsSectionProps) => {
  const { t } = useTranslation('developers');

  const onLabsClicked = () => {
    logButtonClick('navigation_drawer_labs');
  };

  const content = (
    <div className={styles.flow}>
      <div>{t('labs-pitch')}</div>
      {variant === 'drawer' && <div>{t('labs-description')}</div>}
      <div className={styles.actions}>
        <Link href="https://labs.quran.com" isNewTab className={styles.joinCommunityLink}>
          <Button href="" type={ButtonType.Success} onClick={onLabsClicked}>
            {t('labs-cta')}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (variant === 'inline') return content;

  return <div className={styles.container}>{content}</div>;
};

export default LabsSection;
