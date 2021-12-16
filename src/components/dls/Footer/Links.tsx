import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

const Links = () => {
  const { t } = useTranslation('common');
  const linksGroup = [
    {
      title: 'Navigate',
      links: [
        { text: t('home'), url: '/' },
        { text: t('about'), url: '/about-us' },
        { text: t('mobile-apps'), url: '/apps' },
        { text: t('developers'), url: '/developers' },
        { text: t('product-updates'), url: '/product-updates' },
        { text: t('feedback'), url: 'https://feedback.quran.com/' },
      ],
    },
    {
      title: 'Useful sites',
      links: [
        { text: 'Quranicaudio.com', url: 'https://quranicaudio.com' },
        { text: 'Salah.com', url: 'https://salah.com' },
        { text: 'Sunnah.com', url: 'https://sunnah.com' },
        { text: 'legacy.quran.com', url: 'https://legacy.quran.com' },
        { text: 'corpus.quran.com', url: 'https://corpus.quran.com' },
        { text: 'QuranReflect.com', url: 'https://quranreflect.com' },
      ],
    },
    {
      title: 'Other links',
      links: [
        { text: 'Sitemap', url: '/sitemap' },
        { text: t('help'), url: '/support' },
        { text: t('privacy'), url: '/privacy' },
        { text: 'Surah Yaseeen', url: '/surah-ya-sin' },
        { text: 'Ayat Al-kursi', url: '/ayatul-kursi' },
        { text: 'Surah Al-kahf', url: '/surah-al-kahf' },
      ],
    },
  ];
  return (
    <div className={styles.groupListContainer}>
      {linksGroup.map((group) => (
        <div className={styles.group} key={group.title}>
          <div className={styles.groupTitle}>{group.title}</div>
          <div>
            {group.links.map((link) => (
              <div key={link.url} className={styles.linkContainer}>
                <Link href={link.url} variant={LinkVariant.Primary}>
                  {link.text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Links;
