/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { getCanonicalUrl } from 'src/utils/navigation';

const DevelopersPage = () => {
  const { t, lang } = useTranslation('developers');
  return (
    <>
      <NextSeoWrapper title={t('common:developers')} url={getCanonicalUrl(lang, '/developers')} />
      <div className={styles.contentPage}>
        <h1>{t('header')}</h1>
        <p>{t('main-desc')}</p>
        <p>
          <Trans
            i18nKey="developers:sub-main-desc"
            components={[<a key={0} href="https://tarteel.ai" target="_blank" rel="noreferrer" />]}
          />
        </p>
        <p>
          <Trans
            i18nKey="developers:projects.all"
            components={[
              <a key={0} href="http://github.com/quran" target="_blank" rel="noreferrer" />,
            ]}
          />
        </p>
        <div>
          <p>
            <Trans
              i18nKey="developers:projects.q-next"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/quran.com-frontend-next"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
          <p>
            <Trans
              i18nKey="developers:projects.q-api"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/quran.com-api"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
          <p>
            <Trans
              i18nKey="developers:projects.q-android"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/quran_android"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
          <p>
            <Trans
              i18nKey="developers:projects.q-ios"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/quran-ios"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
          <p>
            <Trans
              i18nKey="developers:projects.q-audio"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/audio.quran.com"
                  target="_blank"
                  rel="noreferrer"
                />,
                <a
                  key={1}
                  href="https://github.com/quran/quranicaudio-app"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
        </div>
        <p>
          <Trans
            i18nKey="developers:issues-guide"
            components={[
              <a
                key={0}
                href="https://github.com/quran/quran.com-frontend-next/pulls"
                target="_blank"
                rel="noreferrer"
              />,
              <a
                key={1}
                href="https://github.com/quran/quran.com-frontend-next/pulls"
                target="_blank"
                rel="noreferrer"
              />,
            ]}
          />
        </p>
        <p>{t('issues-cta')}</p>
        <p>{t('thanks')}</p>
        <p>{t('footer')}</p>
      </div>
    </>
  );
};

export default DevelopersPage;
