import classNames from 'classnames';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import styles from './HomePageApps.module.scss';

import { logButtonClick } from '@/utils/eventLogger';

interface App {
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
}

const HomePageApps: React.FC = () => {
  const { t } = useTranslation('home');

  const handleAppClick = (appId: string) => {
    logButtonClick(`home_apps_${appId.replaceAll('-', '_')}`);
  };

  const apps: App[] = [
    {
      id: 'quranreflect',
      name: t('apps.quranreflect.name'),
      description: t('apps.quranreflect.description'),
      iconSrc: '/images/app-portal/icon_web_optimized.png',
      iconAlt: t('apps.quranreflect.name'),
      href: 'https://quranreflect.com/apps',
    },
    {
      id: 'qariah',
      name: t('apps.qariah.name'),
      description: t('apps.qariah.description'),
      iconSrc: '/images/app-portal/featured/qaariah-icon.webp',
      iconAlt: t('apps.qariah.name'),
      href: 'https://qariah.app',
    },
    {
      id: 'quran-space',
      name: t('apps.quran-space.name'),
      description: t('apps.quran-space.description'),
      iconSrc: '/images/app-portal/quran-space-100.jpg',
      iconAlt: t('apps.quran-space.name'),
      href: 'https://spaces.labs.quran.com',
    },
    {
      id: 'quran-ios',
      name: t('apps.quran-ios.name'),
      description: t('apps.quran-ios.description'),
      iconSrc: '/images/app-portal/qdc-ios-logo.webp',
      iconAlt: t('apps.quran-ios.name'),
      href: 'https://apps.apple.com/us/app/quran-by-quran-com-%D9%82%D8%B1%D8%A2%D9%86/id1118663303',
    },
    {
      id: 'quran-android',
      name: t('apps.quran-android.name'),
      description: t('apps.quran-android.description'),
      iconSrc: '/images/app-portal/qdc-android-logo.webp',
      iconAlt: t('apps.quran-android.name'),
      href: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('apps.title')}</h2>
        <p className={styles.subtitle}>{t('apps.description')}</p>
      </div>
      <div className={styles.appsContainer}>
        <div className={styles.appsHeader}>
          <div className={styles.featured}>{t('apps.featured-apps')}</div>
          <Link
            href="/apps"
            className={styles.seeMoreLink}
            onClick={() => logButtonClick('home_apps_see_more')}
          >
            {t('apps.see-more')}
          </Link>
        </div>
        <div className={styles.apps}>
          {apps.map((app) => (
            <Link
              key={app.id}
              href="/apps"
              className={classNames(styles.appCard, styles[app.id])}
              onClick={() => handleAppClick(app.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.iconSrc} alt={app.iconAlt} className={styles.appIconImage} />

              <div className={styles.appInfo}>
                <h3 className={styles.appName}>{app.name}</h3>
                <p className={styles.appDescription}>{app.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageApps;
