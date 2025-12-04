import useTranslation from 'next-translate/useTranslation';

import styles from './HeaderNavigation.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import ArrowLeft from '@/icons/arrow-left.svg';
import Background from '@/icons/background.svg';

interface HeaderNavigationProps {
  backUrl: string;
  title: string;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ backUrl, title }) => {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroBackgroundImage}>
        <Background aria-hidden="true" focusable="false" />
      </div>
      <div>
        <div className={styles.heroInnerContainer}>
          <Button
            type={ButtonType.Secondary}
            size={isMobile ? ButtonSize.Small : ButtonSize.Medium}
            variant={ButtonVariant.Compact}
            href={backUrl}
            ariaLabel={t('back')}
          >
            <ArrowLeft />
          </Button>
          <h1>{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigation;
