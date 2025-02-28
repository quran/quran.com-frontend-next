/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link from '@/dls/Link/Link';
import { getBlurDataUrl } from '@/utils/image';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

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
      <PageContainer>
        <div className={styles.contentPage}>
          <h1>{t('common:about')}</h1>
          <p>
            <Trans i18nKey="about:main-description" />
          </p>

          <h2 className={styles.heading}>{t('our-mission.title')}</h2>
          <p>{t('our-mission.desc')}</p>

          <h2 className={styles.heading}>{t('key-features.title')}</h2>
          <p>{t('key-features.desc')}</p>
          <ul className={styles.list}>
            {Array.isArray(t('key-features.features', {}, { returnObjects: true }))
              ? (t('key-features.features', {}, { returnObjects: true }) as string[]).map(
                  (feature, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={`feature-${index}`}>{feature}</li>
                  ),
                )
              : null}
          </ul>

          <h2 className={styles.heading}>{t('who-we-are.title')}</h2>
          <p>{t('who-we-are.desc')}</p>

          <h2 className={styles.heading}>{t('global-effort.title')}</h2>
          <p>{t('global-effort.desc')}</p>

          <h2 className={styles.heading}>{t('credits.title')}</h2>
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
                  <a
                    key={0}
                    target="_blank"
                    href="https://qurancomplex.gov.sa/"
                    rel="noreferrer"
                  />,
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
                  <a
                    key={0}
                    target="_blank"
                    href="https://quranenc.com/en/home"
                    rel="noreferrer"
                  />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="about:credits.zekr"
                components={[
                  <a key={0} target="_blank" href="https://zekr.org" rel="noreferrer" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="about:credits.tarteel"
                components={[
                  <a key={0} target="_blank" href="https://tarteel.ai/" rel="noreferrer" />,
                ]}
              />
            </li>
            <li>
              <Trans
                i18nKey="about:credits.lokalize"
                components={[
                  <a key={0} target="_blank" href="https://lokalise.com/" rel="noreferrer" />,
                ]}
              />
              <div className={styles.image}>
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
            </li>
            <li>
              <Trans
                i18nKey="about:credits.vercel"
                components={[
                  <a
                    key={0}
                    target="_blank"
                    href="https://vercel.com/?utm_source=quran-pro&utm_campaign=oss"
                    rel="noreferrer"
                  />,
                ]}
              />
              <Link href="https://vercel.com/?utm_source=quran-pro&utm_campaign=oss" isNewTab>
                <div className={styles.image}>
                  <Image
                    src="/images/powered-by-vercel.svg"
                    layout="fixed"
                    width={150}
                    height={70}
                    placeholder="blur"
                    blurDataURL={getBlurDataUrl(300, 70)}
                    alt="Vercel"
                  />
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </PageContainer>
    </>
  );
};

export default AboutUsPage;
