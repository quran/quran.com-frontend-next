/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { GetStaticProps, NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Link from '@/dls/Link/Link';
import ChaptersData from '@/types/ChaptersData';
import { getAllChaptersData } from '@/utils/chapter';
import { logTarteelLinkClick } from '@/utils/eventLogger';
import { getBlurDataUrl } from '@/utils/image';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const PATH = '/about-us';
const CREDIT_LINKS = [
  {
    key: 0,
    i18nKey: 'about:credits.tanzil',
    href: 'https://tanzil.net/',
  },
  {
    key: 1,
    i18nKey: 'about:credits.quran-complex',
    href: 'https://qurancomplex.gov.sa/',
  },
  {
    key: 2,
    i18nKey: 'about:credits.quran-align',
    href: 'https://github.com/cpfair/quran-align',
  },
  {
    key: 3,
    i18nKey: 'about:credits.quran-enc',
    href: 'https://quranenc.com/en/home',
  },
  {
    key: 4,
    i18nKey: 'about:credits.zekr',
    href: 'https://zekr.org',
  },
  {
    key: 5,
    i18nKey: 'about:credits.lokalize',
    href: 'https://lokalise.com/',
    image: '/images/lokalize.png',
    alt: 'Lokalise',
  },
  {
    key: 6,
    i18nKey: 'about:credits.vercel',
    href: 'https://vercel.com/?utm_source=quran-pro&utm_campaign=oss',
    image: '/images/powered-by-vercel.svg',
    alt: 'Vercel',
  },
];

type AboutUsPageProps = {
  chaptersData: ChaptersData;
};

const AboutUsPage: NextPage<AboutUsPageProps> = (): JSX.Element => {
  const { t, lang } = useTranslation('about');

  const onTarteelLinkClicked = () => {
    logTarteelLinkClick('about_us_page');
  };

  return (
    <>
      <NextSeoWrapper
        title={t('common:about')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
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
            {CREDIT_LINKS.map((link) => (
              <li key={link.key}>
                <Trans
                  i18nKey={link.i18nKey}
                  components={[<a key={0} target="_blank" href={link.href} rel="noreferrer" />]}
                />
                {link?.image ? (
                  <div className={styles.image}>
                    <Image
                      src={link.image}
                      layout="fixed"
                      width={300}
                      height={70}
                      placeholder="blur"
                      blurDataURL={getBlurDataUrl(300, 70)}
                      alt={link?.alt}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default AboutUsPage;
