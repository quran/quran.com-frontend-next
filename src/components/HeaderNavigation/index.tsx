import Head from 'next/head';

import styles from './HeaderNavigation.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ArrowLeft from '@/icons/arrow-left.svg';
import Background from '@/icons/background.svg';
import { isMobile } from '@/utils/responsive';

interface Props {
  backUrl: string;
  title: string;
}

const HeaderNavigation: React.FC<Props> = ({ backUrl, title }) => {
  return (
    <div className={styles.heroContainer}>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" />
      </Head>
      <div className={styles.heroBackgroundImage}>
        <Background />
      </div>
      <div>
        <div className={styles.heroInnerContainer}>
          <Button
            type={ButtonType.Secondary}
            size={isMobile() ? ButtonSize.Small : ButtonSize.Large}
            variant={ButtonVariant.Compact}
            href={backUrl}
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
