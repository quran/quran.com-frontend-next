import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './HeaderNavigation.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import ArrowLeft from '@/icons/arrow-left.svg';
import Background from '@/icons/background.svg';

interface HeaderNavigationProps {
  title: string;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ title }) => {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const router = useRouter();

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
            ariaLabel={t('back')}
            onClick={() => router.back()}
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
