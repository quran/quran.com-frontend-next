/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link from '@/dls/Link/Link';
import { logTarteelLinkClick } from '@/utils/eventLogger';
import { getBlurDataUrl } from '@/utils/image';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const path = '/about-us';
const AboutUsPage = () => {
  const { t, lang } = useTranslation('about');

  const onTarteelLinkClicked = () => {
    logTarteelLinkClick('about_us_page');
  };

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
            <Trans
              i18nKey="about:main-description"
              components={[
                <Link key={0} href="https://tarteel.ai" isNewTab onClick={onTarteelLinkClicked} />,
              ]}
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
