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
        { text: t('help'), url: '/support' },
      ],
    },
    {
      title: 'Networks',
      links: [
        { text: 'QuranicAudio.com', url: 'https://quranicaudio.com' },
        { text: 'Salah.com', url: 'https://salah.com' },
        { text: 'Sunnah.com', url: 'https://sunnah.com' },
        { text: 'Legacy.Quran.com', url: 'https://legacy.quran.com' },
        { text: 'Corpus.Quran.com', url: 'https://corpus.quran.com' },
        { text: 'QuranReflect.com', url: 'https://quranreflect.com' },
        { text: 'Tarteel', url: 'https://www.tarteel.ai/' },
      ],
    },
    {
      title: 'Other links',
      links: [
        { text: t('surah-yaseen'), url: '/surah-ya-sin' },
        { text: t('ayat-al-kursi'), url: '/ayatul-kursi' },
        { text: t('surah-al-kahf'), url: '/surah-al-kahf' },
        { text: t('surah-al-mulk'), url: '/surah-al-mulk' },
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
