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

interface AppLinks {
  androidHref?: string;
  iosHref?: string;
  webHref?: string;
}

interface FeaturedApp extends AppLinks {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
}

interface AppTile extends AppLinks {
  id: string;
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  categories: AppCategory[];
  tagline?: string;
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

type AppPlatform = 'android' | 'ios' | 'web';

interface AppCtaLabels {
  playStoreAlt: string;
  appStoreAlt: string;
  webCtaText: string;
}

const VisitBadge: FC<{ label: string }> = ({ label }) => (
  <svg
    className={styles.storeBadgeImage}
    width={96}
    height={32}
    viewBox="0 0 135 40"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="135" height="40" rx="5" fill="#000" />
    <g transform="translate(8 7)">
      <g transform="scale(1.1)">
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12H22"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
    <text
      x="46"
      y="20"
      fill="#FFF"
      fontSize="15"
      fontFamily="inherit"
      fontWeight="600"
      dominantBaseline="middle"
    >
      {label}
    </text>
  </svg>
);

const DEBOUNCE_DELAY = 1000;

const getFeaturedApps = (t: (key: string) => string): FeaturedApp[] => [
  {
    id: 'qariah',
    name: t('featured.apps.qariah.name'),
    tagline: t('featured.apps.qariah.tagline'),
    description: t('featured.apps.qariah.headline'),
    iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
    iconAlt: 'Qariah – women Quran reciters app',
    webHref: 'https://www.qariah.app/',
    iosHref: 'https://apps.apple.com/us/app/qariah/id1594917787',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.qariah.app',
  },
  {
    id: 'quran-space',
    name: t('featured.apps.quran-space.name'),
    tagline: t('featured.apps.quran-space.tagline'),
    description: t('featured.apps.quran-space.headline'),
    iconSrc: '/images/app-portal/featured/quran-space-icon.png',
    iconAlt: 'Quran Spaces',
    webHref: 'https://spaces.labs.quran.com/',
  },
  {
    id: 'quranreflect',
    name: t('browse.apps.quranreflect.title'),
    tagline: t('browse.apps.quranreflect.tagline'),
    description: t('browse.apps.quranreflect.description'),
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    webHref: 'https://quranreflect.com',
    androidHref:
      'https://play.google.com/store/apps/details?id=com.quranreflect.quranreflect&hl=en',
    iosHref: 'https://apps.apple.com/us/app/quranreflect/id1444969758',
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
    description: t('browse.apps.quran_android.description'),
    tagline: t('browse.apps.quran_android.tagline'),
    iconSrc: '/images/app-portal/qdc-android-logo.webp',
    iconAlt: 'Quran for Android',
    androidHref: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quran_ios',
    title: t('browse.apps.quran_ios.title'),
    description: t('browse.apps.quran_ios.description'),
    tagline: t('browse.apps.quran_ios.tagline'),
    iconSrc: '/images/app-portal/qdc-ios-logo.webp',
    iconAlt: 'Quran for iOS',
    iosHref:
      'https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303',
    categories: ['quran-reader', 'community', 'popular', 'study-tools'],
  },
  {
    id: 'quran-kareem',
    title: t('featured.apps.quran-kareem.name'),
    description: t('featured.apps.quran-kareem.headline'),
    tagline: t('featured.apps.quran-kareem.tagline'),
    iconSrc: '/images/app-portal/featured/quran_kareem-icon.png',
    iconAlt: 'Quran Kareem app',
    iosHref:
      'https://apps.apple.com/us/app/quran-kareem-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1338804415',
    categories: ['quran-reader', 'popular'],
  },
  {
    id: 'quran-link',
    title: t('featured.apps.quran-link.name'),
    description: t('featured.apps.quran-link.headline'),
    tagline: t('featured.apps.quran-link.tagline'),
    iconSrc: '/images/app-portal/featured/QuranLink-icon.png',
    iconAlt: 'Quran Link app',
    iosHref:
      'https://apps.apple.com/us/app/quran-link-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1425763263',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.qortoba.quran.link',
    webHref: 'https://quran.link/',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
  {
    id: 'quranreflect',
    title: t('browse.apps.quranreflect.title'),
    description: t('browse.apps.quranreflect.description'),
    tagline: t('browse.apps.quranreflect.tagline'),
    iconSrc: '/images/app-portal/icon_web_optimized.png',
    iconAlt: 'QuranReflect',
    webHref: 'https://quranreflect.com',
    androidHref:
      'https://play.google.com/store/apps/details?id=com.quranreflect.quranreflect&hl=en',
    iosHref: 'https://apps.apple.com/us/app/quranreflect/id1444969758',
    categories: ['reflections', 'community'],
  },
  {
    id: 'sunnah',
    title: t('browse.apps.sunnah.title'),
    description: t('browse.apps.sunnah.description'),
    tagline: t('browse.apps.sunnah.tagline'),
    iconSrc: '/images/app-portal/sunnah_icon_web_optimized.png',
    iconAlt: 'Sunnah.com',
    webHref: 'https://sunnah.com',
    categories: ['hadith-sunnah', 'popular'],
  },
  {
    id: 'readtafsir',
    title: t('browse.apps.readtafsir.title'),
    description: t('browse.apps.readtafsir.description'),
    tagline: t('browse.apps.readtafsir.tagline'),
    iconSrc: '/images/app-portal/readtafsir_app_icon.png',
    iconAlt: 'ReadTafsir',
    webHref: 'https://read.tafsir.one/',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=one.tafsir.read',
    iosHref:
      'https://apps.apple.com/gb/app/%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%AA%D9%81%D8%A7%D8%B9%D9%84%D9%8A/id6503959086',
    categories: ['study-tools', 'quran-reader', 'popular'],
  },
  {
    id: 'tafsirapp',
    title: t('browse.apps.tafsirapp.title'),
    description: t('browse.apps.tafsirapp.description'),
    tagline: t('browse.apps.tafsirapp.tagline'),
    iconSrc: '/images/app-portal/tafsir_app_icon.png',
    iconAlt: 'Tafsir App',
    webHref: 'https://tafsir.app/',
    androidHref: 'https://play.google.com/store/apps/details?id=com.thedawah.furqan',
    iosHref:
      'https://apps.apple.com/sa/app/%D8%A7%D9%84%D8%A8%D8%A7%D8%AD%D8%AB-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%D9%8A/id1450111969',
    categories: ['study-tools', 'quran-reader'],
  },
  {
    id: 'muhaffidh',
    title: t('browse.apps.muhaffidh.title'),
    description: t('browse.apps.muhaffidh.description'),
    tagline: t('browse.apps.muhaffidh.tagline'),
    iconSrc: '/images/app-portal/muhaffidh_app_icon.png',
    iconAlt: 'Muhaffidh App',
    webHref: 'https://muhaffidh.app/',
    androidHref: 'https://play.google.com/store/apps/details?hl=en&id=com.nuqayah.muhaffidh',
    iosHref:
      'https://apps.apple.com/us/app/%D8%A7%D9%84%D9%85%D8%B5%D8%AD%D9%81-%D8%A7%D9%84%D9%85%D8%AD%D9%81%D8%B8/id6642706361',
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
  ctaLabels: AppCtaLabels;
}

interface BrowseAppsProps {
  noResultsText: string;
  searchLabel: string;
  filters: FilterChip[];
  apps: AppTile[];
  title: string;
  ctaLabels: AppCtaLabels;
}

const path = '/apps';

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

interface AppCtaRowProps extends AppLinks {
  appId: string;
  appName: string;
  ctaLabels: AppCtaLabels;
  eventName: string;
  categories?: AppCategory[];
}

const AppCtaRow: FC<AppCtaRowProps> = ({
  androidHref,
  iosHref,
  webHref,
  appId,
  appName,
  ctaLabels,
  eventName,
  categories,
}) => {
  if (!androidHref && !iosHref && !webHref) {
    return null;
  }

  const handleClick = (platform: AppPlatform) => {
    logButtonClick(eventName, {
      appId,
      appName,
      platform,
      ...(categories ? { categories } : {}),
    });
  };

  return (
    <div className={styles.cardActions}>
      {androidHref && (
        <a
          className={styles.storeBadge}
          href={androidHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.playStoreAlt}
          onClick={() => handleClick('android')}
        >
          <Image
            alt={ctaLabels.playStoreAlt}
            src="/images/play-store.svg"
            width={96}
            height={32}
            className={styles.storeBadgeImage}
          />
        </a>
      )}
      {iosHref && (
        <a
          className={styles.storeBadge}
          href={iosHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.appStoreAlt}
          onClick={() => handleClick('ios')}
        >
          <Image
            alt={ctaLabels.appStoreAlt}
            src="/images/app-store.svg"
            width={96}
            height={32}
            className={styles.storeBadgeImage}
          />
        </a>
      )}
      {webHref && (
        <a
          className={styles.storeBadge}
          href={webHref}
          target="_blank"
          rel="noreferrer"
          aria-label={ctaLabels.webCtaText}
          onClick={() => handleClick('web')}
        >
          <VisitBadge label={ctaLabels.webCtaText} />
        </a>
      )}
    </div>
  );
};

const FeaturedCard: FC<{ app: FeaturedApp; ctaLabels: AppCtaLabels }> = ({ app, ctaLabels }) => (
  <article className={styles.featuredCard}>
    <div className={styles.cardBody}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="70px"
            className={styles.appIconImage}
          />
        </span>
        <div className={styles.appMetaText}>
          <div className={styles.appName}>{app.name}</div>
          {app.tagline && <div className={styles.appTagline}>{app.tagline}</div>}
        </div>
      </div>
      <p className={styles.appDescription}>{app.description}</p>
      <AppCtaRow
        appId={app.id}
        appName={app.name}
        androidHref={app.androidHref}
        iosHref={app.iosHref}
        webHref={app.webHref}
        ctaLabels={ctaLabels}
        eventName="app_portal_featured_app_cta"
      />
    </div>
  </article>
);

interface FeaturedAppsProps {
  title: string;
  viewAllText: string;
  apps: FeaturedApp[];
  ctaLabels: AppCtaLabels;
}

const FeaturedApps: FC<FeaturedAppsProps> = ({ title, viewAllText, apps, ctaLabels }) => (
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
        <FeaturedCard key={app.id} app={app} ctaLabels={ctaLabels} />
      ))}
    </div>
  </section>
);

const AppTileCard: FC<{ app: AppTile; ctaLabels: AppCtaLabels }> = ({ app, ctaLabels }) => (
  <article className={styles.appCard}>
    <div className={styles.cardBody}>
      <div className={styles.appMeta}>
        <span className={styles.appIcon} aria-hidden="true">
          <Image
            alt={app.iconAlt}
            src={app.iconSrc}
            fill
            sizes="70px"
            className={styles.appIconImage}
          />
        </span>
        <div className={styles.appMetaText}>
          <div className={styles.appName}>{app.title}</div>
          {app.tagline && <div className={styles.appTagline}>{app.tagline}</div>}
        </div>
      </div>
      <p className={styles.appDescription}>{app.description}</p>
      <AppCtaRow
        appId={app.id}
        appName={app.title}
        androidHref={app.androidHref}
        iosHref={app.iosHref}
        webHref={app.webHref}
        ctaLabels={ctaLabels}
        eventName="app_portal_app_tile_cta"
        categories={app.categories}
      />
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

const AppGrid: FC<AppGridProps> = ({ apps, emptyText, ctaLabels }) => {
  if (!apps.length) {
    return <p className={styles.emptyState}>{emptyText}</p>;
  }

  return (
    <div className={styles.appGrid}>
      {apps.map((app) => (
        <AppTileCard key={app.id} app={app} ctaLabels={ctaLabels} />
      ))}
    </div>
  );
};

const BrowseApps: FC<BrowseAppsProps> = ({
  noResultsText,
  searchLabel,
  filters,
  apps,
  title,
  ctaLabels,
}) => {
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
        app.description.toLowerCase().includes(normalizedQuery);

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
        <AppGrid apps={filteredApps} emptyText={noResultsText} ctaLabels={ctaLabels} />
      </div>
    </section>
  );
};

const AppPortalPage: NextPage = () => {
  const { t, lang } = useTranslation('app-portal');
  const { t: tCommon } = useTranslation('common');

  const featuredApps = useMemo(() => getFeaturedApps(t), [t]);
  const appTiles = useMemo(() => getAppTiles(t), [t]);
  const ctaLabels = useMemo(
    () => ({
      playStoreAlt: t('cta.google-play'),
      appStoreAlt: t('cta.app-store'),
      webCtaText: t('cta.visit'),
    }),
    [t],
  );

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
            ctaLabels={ctaLabels}
          />
          <BrowseApps
            noResultsText={tCommon('search.no-results')}
            searchLabel={tCommon('search.title')}
            filters={filters}
            apps={appTiles}
            title={t('browse.title')}
            ctaLabels={ctaLabels}
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
