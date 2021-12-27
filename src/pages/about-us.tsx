/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import styles from './contentPage.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { getBlurDataUrl } from 'src/utils/image';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';

const path = '/about-us';
const AboutUsPage = () => {
  const { t, lang } = useTranslation('about');
  return (
    <>
      <NextSeoWrapper
        title={t('common:about')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <div className={styles.contentPage}>
        <h1>{t('common:about')}</h1>
        <p>
          <Trans
            i18nKey="about:main-description"
            components={[<a key={0} href="https://tarteel.ai" target="_blank" rel="noreferrer" />]}
          />
        </p>
        <p className={styles.heading}>{t('credits.title')}</p>
        <p>{t('credits.desc')}</p>
        <ul className={styles.list}>
          <li>
            <Trans
              i18nKey="about:credits.tanzil"
              components={[
                <a key={0} target="_blank" href="https://tanzil.net/" rel="noreferrer" />,
              ]}
            />
          </li>
          <li>
            <Trans
              i18nKey="about:credits.quran-complex"
              components={[
                <a key={0} target="_blank" href="https://qurancomplex.gov.sa/" rel="noreferrer" />,
              ]}
            />
          </li>
          <li>
            <Trans
              i18nKey="about:credits.quran-align"
              components={[
                <a
                  key={0}
                  target="_blank"
                  href="https://github.com/cpfair/quran-align"
                  rel="noreferrer"
                />,
              ]}
            />
          </li>
          <li>
            <Trans
              i18nKey="about:credits.quran-enc"
              components={[
                <a key={0} target="_blank" href="https://quranenc.com/en/home" rel="noreferrer" />,
              ]}
            />
          </li>
          <li>
            <Trans
              i18nKey="about:credits.zekr"
              components={[<a key={0} target="_blank" href="https://zekr.org" rel="noreferrer" />]}
            />
          </li>
          <li>
            <Trans
              i18nKey="about:credits.lokalize"
              components={[
                <a key={0} target="_blank" href="https://lokalise.com/" rel="noreferrer" />,
              ]}
            />
          </li>
        </ul>
        <div className={styles.lokalizeImage}>
          <Image
            src="/images/lokalize.png"
            layout="fixed"
            width={300}
            height={70}
            placeholder="blur"
            blurDataURL={getBlurDataUrl(300, 70)}
            alt="Lokalise"
          />
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;
