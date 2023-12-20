import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import QuranTextLogo from '@/icons/quran-text-logo.svg';
import { logButtonClick } from '@/utils/eventLogger';

const TitleAndDescription = () => {
  const { t } = useTranslation('common');

  const onHiringAnnouncementClicked = () => {
    logButtonClick('footer_hiring_announcement');
  };

  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranTextLogo />
        </div>
        <div className={styles.title}>{t('footer.title')}</div>
      </div>
      <p className={styles.description}>{t('footer.description')}</p>
      <div className={styles.hiringAnnouncementContainer}>
        <Trans
          components={{
            link: (
              <Link
                href="https://www.quran.foundation/careers"
                variant={LinkVariant.Blend}
                onClick={onHiringAnnouncementClicked}
                isNewTab
              />
            ),
          }}
          i18nKey="common:footer.hiring"
        />
      </div>
    </div>
  );
};

export default TitleAndDescription;
