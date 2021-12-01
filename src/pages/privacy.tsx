/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';

const PrivacyPage = () => {
  const { t } = useTranslation('privacy');
  return (
    <>
      <NextSeoWrapper title={t('header')} />
      <div className={styles.contentPage}>
        <h1>{t('header')}</h1>
        <p>
          <Trans
            i18nKey="privacy:main-desc"
            components={[<a href="https://salah.com" target="_blank" rel="noreferrer" />]}
          />
        </p>
        <p>
          <Trans
            i18nKey="privacy:ga"
            components={[
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="nofollow noreferrer noopener"
              />,
            ]}
          />
        </p>
        <p>
          <Trans i18nKey="privacy:footer" />
        </p>
      </div>
    </>
  );
};

export default PrivacyPage;
