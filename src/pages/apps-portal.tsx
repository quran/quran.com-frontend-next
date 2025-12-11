/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines, react/no-multi-comp */

import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './apps-portal.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import useDebounce from '@/hooks/useDebounce';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getAllChaptersData } from '@/utils/chapter';
import { logButtonClick, logTextSearchQuery, logValueChange } from '@/utils/eventLogger';
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
  learnMoreText?: string;
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
  learnMoreText?: string;
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

const DEBOUNCE_DELAY = 1000;

const getFeaturedApps = (t: (key: string) => string): FeaturedApp[] => [
  {
    id: 'qariah',
    name: t('featured.apps.qariah.name'),
    tagline: t('featured.apps.qariah.tagline'),
    headline: t('featured.apps.qariah.headline'),
    background: "url('/images/app-portal/featured/qaariah-pic.jpg')",
    iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
    iconAlt: 'Qariah – women Quran reciters app',
    href: 'https://www.qariah.app/',
  },
  {
    id: 'quran-kareem',
    name: t('featured.apps.quran-kareem.name'),
    tagline: t('featured.apps.quran-kareem.tagline'),
    headline: t('featured.apps.quran-kareem.headline'),
    background: "url('/images/app-portal/featured/quran_kareem-pic.webp')",
    iconSrc: '/images/app-portal/featured/quran_kareem-icon.png',
    iconAlt: 'Quran Kareem app',
    href: 'https://apps.apple.com/us/app/quran-kareem-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1338804415',
  },
  {
    id: 'quran-link',
    name: t('featured.apps.quran-link.name'),
    tagline: t('featured.apps.quran-link.tagline'),
    headline: t('featured.apps.quran-link.headline'),
    background: "url('/images/app-portal/featured/QuranLink-pic.png')",
    iconSrc: '/images/app-portal/featured/QuranLink-icon.png',
    iconAlt: 'Quran Link app',
    href: 'https://apps.apple.com/us/app/quran-link-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1425763263',
  },
];

const getFilters = (t: (key: string) => string): FilterChip[] => [
  { label: t('browse.filters.all'), value: 'all' },
  { label: t('browse.filters.study-tools'), value: 'study-tools' },
  { label: t('browse.filters.reflections'), value: 'reflections' },
  { label: t('browse.filters.popular'), value: 'popular' },
  { label: t('browse.filters.quran-reader'), value: 'quran-reader' },
  { label: t('browse.filters.community'), value: 'community' },
  { label: t('browse.filters.hadith-sunnah'), value: 'hadith-sunnah' },
];

const getAppTiles = (t: (key: string) => string): AppTile[] => [
  {
    id: 'quran_android',
    title: t('browse.apps.quran_android.title'),
    caption: t('browse.apps.quran_android.caption'),
    visual: "url('/images/app-portal/qdc-android.png')",
    iconSrc: '/images/app-portal/qdc-android-logo.webp',
    iconAlt: 'Quran for Android',
    href: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quran_ios',
    title: t('browse.apps.quran_ios.title'),
    caption: t('browse.apps.quran_ios.caption'),
    visual: "url('/images/app-portal/qdc-ios.png')",
    iconSrc: '/images/app-portal/qdc-ios-logo.webp',
    iconAlt: 'Quran for iOS',
    href: 'https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quranreflect',
    title: t('browse.apps.quranreflect.title'),
    caption: t('browse.apps.quranreflect.caption'),
    visual: "url('/images/app-portal/qr_web_optimized.png')",
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    href: 'https://quranreflect.com',
    categories: ['reflections', 'community'],
  },
  {
    id: 'sunnah',
    title: t('browse.apps.sunnah.title'),
    caption: t('browse.apps.sunnah.caption'),
    visual: "url('/images/app-portal/hadith_banner_web_optimized.jpg')",
    iconSrc: '/images/app-portal/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    href: 'https://sunnah.com',
    categories: ['hadith-sunnah', 'popular'],
  },

  // -------------------------------------------
  // 1. QuranMeet
  // -------------------------------------------
  {
    id: 'quranmeet',
    title: t('browse.apps.quranmeet.title'),
    caption: t('browse.apps.quranmeet.caption'),
    visual: "url('/images/app-portal/quran_meet-app_pic.png')",
    iconSrc: '/images/app-portal/quran_meet_app.png',
    iconAlt: 'QuranMeet',
    href: 'https://quranmeet.slk.is/',
    categories: ['community', 'study-tools'],
  },

  // -------------------------------------------
  // 2. ReadTafsir (Tafsir.one)
  // -------------------------------------------
  {
    id: 'readtafsir',
    title: t('browse.apps.readtafsir.title'),
    caption: t('browse.apps.readtafsir.caption'),
    visual: "url('/images/app-portal/readtafsir_app_pic.png')",
    iconSrc: '/images/app-portal/readtafsir_app_icon.png',
    iconAlt: 'ReadTafsir',
    href: 'https://read.tafsir.one/',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },

  // -------------------------------------------
  // 3. Tafsir App
  // -------------------------------------------
  {
    id: 'tafsirapp',
    title: t('browse.apps.tafsirapp.title'),
    caption: t('browse.apps.tafsirapp.caption'),
    visual: "url('/images/app-portal/tafsir.app-pic.png')",
    iconSrc: '/images/app-portal/tafsir_app_icon.png',
    iconAlt: 'Tafsir App',
    href: 'https://tafsir.app/',
    categories: ['study-tools', 'quran-reader'],
  },

  // -------------------------------------------
  // 4. Muhaffidh
  // -------------------------------------------
  {
    id: 'muhaffidh',
    title: t('browse.apps.muhaffidh.title'),
    caption: t('browse.apps.muhaffidh.caption'),
    visual: "url('/images/app-portal/muhaffidh_app_pic.png')",
    iconSrc: '/images/app-portal/muhaffidh_app_icon.png',
    iconAlt: 'Muhaffidh App',
    href: 'https://muhaffidh.app/',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
];

interface FiltersBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  onSearchChange: (query: string) => void;
  searchLabel: string;
  searchQuery: string;
  filters: FilterChip[];
}

interface AppGridProps {
  apps: AppTile[];
  emptyText: string;
}

interface BrowseAppsProps {
  noResultsText: string;
  searchLabel: string;
  filters: FilterChip[];
  apps: AppTile[];
  title: string;
}

const path = '/app-portal';

interface HeroProps {
  title: string;
  description: string;
}

const Hero: FC<HeroProps> = ({ title, description }) => (
  <header className={styles.hero}>
    {/* <div className={styles.heroBadge}>Quran Foundation</div> */}
    <h1 className={styles.heroTitle}>{title}</h1>
    <p className={styles.heroSubtitle}>{description}</p>
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
      <a
        className={styles.link}
        href={app.href}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          logButtonClick('app_portal_featured_app_cta', {
            appId: app.id,
            appName: app.name,
          });
        }}
      >
        {app.learnMoreText}
      </a>
    </div>
  </article>
);

interface FeaturedAppsProps {
  title: string;
  viewAllText: string;
  apps: FeaturedApp[];
}

const FeaturedApps: FC<FeaturedAppsProps> = ({ title, viewAllText, apps }) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={styles.sectionLink} href="#browse-apps">
        {viewAllText}
      </a>
    </div>
    <div className={styles.featuredGrid}>
      {apps.map((app) => (
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
      <a
        className={styles.link}
        href={app.href}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          logButtonClick('app_portal_app_tile_cta', {
            appId: app.id,
            appName: app.title,
            categories: app.categories,
          });
        }}
      >
        {app.learnMoreText}
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
  filters,
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

const BrowseApps: FC<BrowseAppsProps> = ({ noResultsText, searchLabel, filters, apps, title }) => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  useEffect(() => {
    logTextSearchQuery(debouncedSearchQuery, SearchQuerySource.AppPortal);
  }, [debouncedSearchQuery]);

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return apps.filter((app) => {
      const matchesFilter = activeFilter === 'all' ? true : app.categories.includes(activeFilter);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        app.title.toLowerCase().includes(normalizedQuery) ||
        app.caption.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, apps]);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      logValueChange('app_portal_filter', activeFilter, filter);
      setActiveFilter(filter);
    },
    [activeFilter],
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <section className={styles.sectionAlt} id="browse-apps">
      <div className={styles.sectionAltInner}>
        <div className={styles.sectionHeaderAlt}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <FiltersBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          searchLabel={searchLabel}
          searchQuery={searchQuery}
          filters={filters}
        />
        <AppGrid apps={filteredApps} emptyText={noResultsText} />
      </div>
    </section>
  );
};

const AppPortalPage: NextPage = () => {
  const { t, lang } = useTranslation('app-portal');
  const { t: tCommon } = useTranslation('common');

  const featuredApps = useMemo(() => {
    const apps = getFeaturedApps(t);
    const learnMoreText = t('featured.learn-more');
    return apps.map((app) => ({ ...app, learnMoreText }));
  }, [t]);

  const appTiles = useMemo(() => {
    const apps = getAppTiles(t);
    const learnMoreText = t('featured.learn-more');
    return apps.map((app) => ({ ...app, learnMoreText }));
  }, [t]);

  const filters = useMemo(() => getFilters(t), [t]);

  return (
    <>
      <NextSeoWrapper
        title={t('quran-apps-portal')}
        description={t('hero.description')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <main className={styles.page}>
          <Hero title={t('hero.title')} description={t('hero.description')} />
          <FeaturedApps
            title={t('featured.title')}
            viewAllText={t('featured.view-all')}
            apps={featuredApps}
          />
          <BrowseApps
            noResultsText={tCommon('search.no-results')}
            searchLabel={tCommon('search.title')}
            filters={filters}
            apps={appTiles}
            title={t('browse.title')}
          />
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
