/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import styles from './contentPage.module.scss';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import { getBlurDataUrl } from 'src/utils/image';
import { getSEOUrl } from 'src/utils/navigation';

const AboutUsPage = () => {
  const { t, lang } = useTranslation('about');
  return (
    <>
      <NextSeoWrapper title={t('common:about')} url={getSEOUrl(lang, '/about-us')} />
      <div className={styles.contentPage}>
        <h1>
          <Trans i18nKey="common:quran-com" />
        </h1>
        <p>{t('main-desc')}</p>
        <p className={styles.heading}>{t('meccan.surahs')}</p>
        <p>{t('meccan.desc')}</p>
        <p className={styles.heading}>{t('median.surahs')}</p>
        <p>{t('median.desc')}</p>
        <p>
          <Trans
            i18nKey="about:redesign"
            components={[
              <a key={0} target="_blank" href="https://feedback.quran.com" rel="noreferrer" />,
            ]}
          />
        </p>
        <p className={styles.heading}>{t('credits.title')}</p>
        <p>
          <Trans
            i18nKey="about:credits.desc"
            components={[
              <a key={0} target="_blank" href="https://tanzil.net/" rel="noreferrer" />,
              <a key={1} target="_blank" href="https://qurancomplex.gov.sa/" rel="noreferrer" />,
              <a
                key={2}
                target="_blank"
                href="https://github.com/cpfair/quran-align"
                rel="noreferrer"
              />,
              <a key={3} target="_blank" href="https://quranenc.com/en/home" rel="noreferrer" />,
              <a key={4} target="_blank" href="https://zekr.org" rel="noreferrer" />,
            ]}
          />
        </p>
        <div>
          <Trans
            i18nKey="about:credits.lokalize"
            components={[
              <a key={0} target="_blank" href="https://lokalise.com/" rel="noreferrer" />,
            ]}
          />
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
        <p>
          <Trans
            i18nKey="about:questions"
            components={[
              <a key={0} target="_blank" href="https://feedback.quran.com" rel="noreferrer" />,
            ]}
          />
        </p>
      </div>
    </>
  );
};

export default AboutUsPage;
