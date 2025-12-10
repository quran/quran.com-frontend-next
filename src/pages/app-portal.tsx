/* eslint-disable max-lines, react/no-multi-comp */

import { FC, useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './app-portal.module.scss';

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

interface AppTile {
  id: string;
  title: string;
  caption: string;
  visual: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
  categories: AppCategory[];
}

type AppCategory =
  | 'study-tools'
  | 'reflections'
  | 'popular'
  | 'quran-reader'
  | 'community'
  | 'hadith-sunnah';

type FilterValue = 'all' | AppCategory;

interface FilterChip {
  label: string;
  value: FilterValue;
}

const featuredApps: FeaturedApp[] = [
  {
    id: 'qariah',
    name: 'Qariah',
    tagline: 'Women Quran reciters',
    headline: 'Finally, a Quran app for our daughters',
    background:
      "linear-gradient(180deg, rgba(9, 47, 56, 0.45), rgba(9, 47, 56, 0.65)), url('/images/featured/app-portal/qariah_banner_web_optimized.jpg')",
    iconSrc: '/images/featured/app-portal/qariah_icon_web_optimized.png',
    iconAlt: 'Qariah – women Quran reciters app',
    href: 'https://www.qariah.app/',
  },
  {
    id: 'quran-kareem',
    name: 'Quran Kareem',
    tagline: 'Read, listen & reflect',
    headline: 'Your new gateway to connect with the Book of Allah',
    background:
      "linear-gradient(180deg, rgba(5, 18, 52, 0.5), rgba(5, 18, 52, 0.7)), url('/images/featured/app-portal/quran_kareem_banner_web_optimized.jpg')",
    iconSrc: '/images/featured/app-portal/quran_kareem_icon_web_optimized.png',
    iconAlt: 'Quran Kareem app',
    href: 'https://apps.apple.com/us/app/quran-kareem-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1338804415',
  },
  {
    id: 'quran-link',
    name: 'Quran Link',
    tagline: 'Tafsir & study companion',
    headline: 'Explore 25+ tafsirs and 100+ translations in one place',
    background:
      "linear-gradient(180deg, rgba(0, 92, 140, 0.45), rgba(0, 92, 140, 0.7)), url('/images/featured/app-portal/quran_link_banner_web_optimized.jpg')",
    iconSrc: '/images/featured/app-portal/quran_link_icon_web_optimized.png',
    iconAlt: 'Quran Link app',
    href: 'https://apps.apple.com/us/app/quran-link-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1425763263',
  },
];

const filters: FilterChip[] = [
  { label: 'All apps', value: 'all' },
  { label: 'Study tools', value: 'study-tools' },
  { label: 'Reflections', value: 'reflections' },
  { label: 'Popular', value: 'popular' },
  { label: 'Quran Reader', value: 'quran-reader' },
  { label: 'Community', value: 'community' },
  { label: 'Hadith and Sunnah', value: 'hadith-sunnah' },
];

const appTiles: AppTile[] = [
  {
    id: 'nuqayah-one',
    title: 'Nuqayah',
    caption: 'Deep dive',
    visual:
      "linear-gradient(180deg, rgba(122, 85, 52, 0.25), rgba(122, 85, 52, 0.25)), url('/images/app-portal/mandala_web_optimized.jpg')",
    iconSrc: '/images/app-portal/calligraphy_web_optimized.png',
    iconAlt: 'Nuqayah',
    href: '#',
    categories: ['study-tools', 'popular'],
  },
  {
    id: 'quranreflect-one',
    title: 'QuranReflect',
    caption: 'Share reflections',
    visual:
      "linear-gradient(180deg, rgba(12, 17, 26, 0.35), rgba(12, 17, 26, 0.35)), url('/images/app-portal/qr_web_optimized.jpg')",
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: '#',
    categories: ['reflections', 'community'],
  },
  {
    id: 'sunnah-one',
    title: 'Sunnah.com',
    caption: 'Hadith collection',
    visual:
      "linear-gradient(180deg, rgba(7, 61, 55, 0.32), rgba(7, 61, 55, 0.32)), url('/images/app-portal/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-portal/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: '#',
    categories: ['hadith-sunnah', 'popular'],
  },
  {
    id: 'nuqayah-two',
    title: 'Nuqayah',
    caption: 'Deep dive',
    visual:
      "linear-gradient(180deg, rgba(122, 85, 52, 0.25), rgba(122, 85, 52, 0.25)), url('/images/app-portal/mandala_web_optimized.jpg')",
    iconSrc: '/images/app-portal/calligraphy_web_optimized.png',
    iconAlt: 'Nuqayah',
    href: '#',
    categories: ['quran-reader', 'study-tools'],
  },
  {
    id: 'quranreflect-two',
    title: 'QuranReflect',
    caption: 'Share reflections',
    visual:
      "linear-gradient(180deg, rgba(12, 17, 26, 0.35), rgba(12, 17, 26, 0.35)), url('/images/app-portal/qr_web_optimized.jpg')",
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: '#',
    categories: ['community', 'reflections', 'popular'],
  },
  {
    id: 'sunnah-two',
    title: 'Sunnah.com',
    caption: 'Hadith collection',
    visual:
      "linear-gradient(180deg, rgba(7, 61, 55, 0.32), rgba(7, 61, 55, 0.32)), url('/images/app-portal/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-portal/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: '#',
    categories: ['hadith-sunnah', 'popular'],
  },
];

interface FiltersBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  onSearchChange: (query: string) => void;
  searchLabel: string;
  searchQuery: string;
}

interface AppGridProps {
  apps: AppTile[];
  emptyText: string;
}

interface BrowseAppsProps {
  noResultsText: string;
  searchLabel: string;
}

const path = '/app-portal';
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

const FiltersBar: FC<FiltersBarProps> = ({
  activeFilter,
  onFilterChange,
  onSearchChange,
  searchLabel,
  searchQuery,
}) => (
  <div className={styles.filters}>
    <div className={styles.search}>
      <span className={styles.searchIcon} aria-hidden="true">
        <Image alt="" src="/images/app-portal/search-icon.svg" width={20} height={20} />
      </span>
      <input
        aria-label={searchLabel}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchLabel}
        type="text"
        value={searchQuery}
      />
    </div>
    <div className={styles.pills}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={classNames(styles.pill, {
            [styles.pillActive]: filter.value === activeFilter,
          })}
          aria-pressed={filter.value === activeFilter}
          onClick={() => onFilterChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  </div>
);

const AppGrid: FC<AppGridProps> = ({ apps, emptyText }) => {
  if (!apps.length) {
    return <p className={styles.emptyState}>{emptyText}</p>;
  }

  return (
    <div className={styles.appGrid}>
      {apps.map((app) => (
        <AppTileCard key={app.id} app={app} />
      ))}
    </div>
  );
};

const BrowseApps: FC<BrowseAppsProps> = ({ noResultsText, searchLabel }) => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return appTiles.filter((app) => {
      const matchesFilter = activeFilter === 'all' ? true : app.categories.includes(activeFilter);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        app.title.toLowerCase().includes(normalizedQuery) ||
        app.caption.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const handleFilterChange = useCallback((filter: FilterValue) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.sectionAltInner}>
        <div className={styles.sectionHeaderAlt}>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <h2 className={styles.sectionTitle}>Browse All Apps</h2>
        </div>
        <FiltersBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          searchLabel={searchLabel}
          searchQuery={searchQuery}
        />
        <AppGrid apps={filteredApps} emptyText={noResultsText} />
      </div>
    </section>
  );
};

const AppPortalPage: NextPage = () => {
  const { t, lang } = useTranslation('common');

  return (
    <>
      <NextSeoWrapper
        title="Quran App Portal"
        description={heroDescription}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <main className={styles.page}>
          <Hero />
          <FeaturedApps />
          <BrowseApps noResultsText={t('search.no-results')} searchLabel={t('search.title')} />
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

export default AppPortalPage;
