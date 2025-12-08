/* eslint-disable max-lines, react/no-multi-comp */

import { FC } from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './app-majlis.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

interface FeaturedApp {
  id: string;
  headline: string;
  name: string;
  tagline: string;
  background: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
}

interface FilterChip {
  label: string;
  isActive?: boolean;
}

interface AppTile {
  id: string;
  title: string;
  caption: string;
  visual: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
}

const featuredApps: FeaturedApp[] = [
  {
    id: 'quranreflect',
    name: 'QuranReflect',
    tagline: 'Share reflections',
    headline: 'Join the QuranReflect community this August as we reflect upon Quranic Duas',
    background:
      "linear-gradient(180deg, rgba(12, 17, 26, 0.35), rgba(12, 17, 26, 0.35)), url('/images/app-majlis/qr_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: '#',
  },
  {
    id: 'sunnah',
    name: 'Sunnah.com',
    tagline: 'Hadith collection',
    headline: 'The Hadith of the Prophet Muhammad at your fingertips',
    background:
      "linear-gradient(180deg, rgba(7, 61, 55, 0.32), rgba(7, 61, 55, 0.32)), url('/images/app-majlis/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: '#',
  },
  {
    id: 'nuqayah',
    name: 'Nuqayah',
    tagline: 'Deep dive',
    headline: 'Nuqayah',
    background:
      "linear-gradient(180deg, rgba(122, 85, 52, 0.25), rgba(122, 85, 52, 0.25)), url('/images/app-majlis/mandala_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/calligraphy_web_optimized.png',
    iconAlt: 'Nuqayah',
    href: '#',
  },
];

const filters: FilterChip[] = [
  { label: 'All apps', isActive: true },
  { label: 'Study tools' },
  { label: 'Reflections' },
  { label: 'Popular' },
  { label: 'Quran Reader' },
  { label: 'Community' },
  { label: 'Hadith and Sunnah' },
];

const appTiles: AppTile[] = [
  {
    id: 'nuqayah-one',
    title: 'Nuqayah',
    caption: 'Deep dive',
    visual:
      "linear-gradient(180deg, rgba(122, 85, 52, 0.25), rgba(122, 85, 52, 0.25)), url('/images/app-majlis/mandala_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/calligraphy_web_optimized.png',
    iconAlt: 'Nuqayah',
    href: '#',
  },
  {
    id: 'quranreflect-one',
    title: 'QuranReflect',
    caption: 'Share reflections',
    visual:
      "linear-gradient(180deg, rgba(12, 17, 26, 0.35), rgba(12, 17, 26, 0.35)), url('/images/app-majlis/qr_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: '#',
  },
  {
    id: 'sunnah-one',
    title: 'Sunnah.com',
    caption: 'Hadith collection',
    visual:
      "linear-gradient(180deg, rgba(7, 61, 55, 0.32), rgba(7, 61, 55, 0.32)), url('/images/app-majlis/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: '#',
  },
  {
    id: 'nuqayah-two',
    title: 'Nuqayah',
    caption: 'Deep dive',
    visual:
      "linear-gradient(180deg, rgba(122, 85, 52, 0.25), rgba(122, 85, 52, 0.25)), url('/images/app-majlis/mandala_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/calligraphy_web_optimized.png',
    iconAlt: 'Nuqayah',
    href: '#',
  },
  {
    id: 'quranreflect-two',
    title: 'QuranReflect',
    caption: 'Share reflections',
    visual:
      "linear-gradient(180deg, rgba(12, 17, 26, 0.35), rgba(12, 17, 26, 0.35)), url('/images/app-majlis/qr_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: '#',
  },
  {
    id: 'sunnah-two',
    title: 'Sunnah.com',
    caption: 'Hadith collection',
    visual:
      "linear-gradient(180deg, rgba(7, 61, 55, 0.32), rgba(7, 61, 55, 0.32)), url('/images/app-majlis/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-majlis/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: '#',
  },
];

const path = '/app-majlis';
const heroDescription =
  'Explore a curated collection of Islamic applications built with Quran.foundation. From study tools to prayer utilities, find apps that enhance your spiritual journey.';

const Hero: FC = () => (
  <header className={styles.hero}>
    {/* <div className={styles.heroBadge}>Quran Foundation</div> */}
    {/* eslint-disable-next-line i18next/no-literal-string */}
    <h1 className={styles.heroTitle}>Discover our Ecosystem of Apps</h1>
    <p className={styles.heroSubtitle}>{heroDescription}</p>
  </header>
);

const FeaturedCard: FC<{ app: FeaturedApp }> = ({ app }) => (
  <article className={styles.featuredCard}>
    {/* self-closing to satisfy react/self-closing-comp, no behavior change */}
    <div className={styles.cardVisual} style={{ backgroundImage: app.background }} />
    <div className={styles.cardFooter}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="44px"
            className={styles.appIconImage}
          />
        </span>
        <div>
          <div className={styles.appName}>{app.name}</div>
          <div className={styles.appTagline}>{app.tagline}</div>
        </div>
      </div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <a className={styles.link} href={app.href}>
        Learn more
      </a>
    </div>
  </article>
);

const FeaturedApps: FC = () => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <h2 className={styles.sectionTitle}>Featured Apps</h2>
      {/* eslint-disable-next-line i18next/no-literal-string, jsx-a11y/anchor-is-valid */}
      <a className={styles.sectionLink} href="#">
        View all
      </a>
    </div>
    <div className={styles.featuredGrid}>
      {featuredApps.map((app) => (
        <FeaturedCard key={app.id} app={app} />
      ))}
    </div>
  </section>
);

const AppTileCard: FC<{ app: AppTile }> = ({ app }) => (
  <article className={styles.appCard}>
    <div className={styles.appVisual} style={{ backgroundImage: app.visual }}>
      {/* <span className={styles.appVisualText}>{app.title}</span> */}
    </div>
    <div className={styles.appFooterRow}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="44px"
            className={styles.appIconImage}
          />
        </span>
        <div>
          <div className={styles.appName}>{app.title}</div>
          <div className={styles.appTagline}>{app.caption}</div>
        </div>
      </div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <a className={styles.link} href={app.href}>
        Learn more
      </a>
    </div>
  </article>
);

const FiltersBar: FC = () => (
  <div className={styles.filters}>
    <div className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">
        <Image alt="" src="/images/app-majlis/search-icon.svg" width={20} height={20} />
      </span>
      <input aria-label="Search apps" placeholder="Search the Quran..." type="text" />
    </div>
    <div className={styles.pills}>
      {filters.map((filter) => (
        <button
          key={filter.label}
          className={classNames(styles.pill, {
            [styles.pillActive]: filter.isActive,
          })}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  </div>
);

const AppGrid: FC = () => (
  <div className={styles.appGrid}>
    {appTiles.map((app) => (
      <AppTileCard key={app.id} app={app} />
    ))}
  </div>
);

const BrowseApps: FC = () => (
  <section className={styles.sectionAlt}>
    <div className={styles.sectionAltInner}>
      <div className={styles.sectionHeaderAlt}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <h2 className={styles.sectionTitle}>Browse All Apps</h2>
      </div>
      <FiltersBar />
      <AppGrid />
    </div>
  </section>
);

const AppMajlisPage: NextPage = () => {
  const { lang } = useTranslation('common');

  return (
    <>
      <NextSeoWrapper
        title="Apps Majlis"
        description={heroDescription}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <main className={styles.page}>
          <Hero />
          <FeaturedApps />
          <BrowseApps />
        </main>
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

export default AppMajlisPage;
