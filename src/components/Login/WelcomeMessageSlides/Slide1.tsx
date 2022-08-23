import Trans from 'next-translate/Trans';

import MoonIllustrationSVG from '../../../../public/images/moon-illustration.svg';
import styles from '../WelcomeMessageModalBody.module.scss';

const Slide1 = ({ action }) => {
  return (
    <div>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>
      <h2 className={styles.title}>
        <Trans
          components={{ br: <br /> }}
          i18nKey="common:announcements.auth-onboarding.slide-1.title"
        />
      </h2>
      <div className={styles.actionContainer}>{action}</div>
    </div>
  );
};

export default Slide1;
