import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuickLinks.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ArrowIcon from '@/public/icons/arrow.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';

enum QuickLinkType {
  Surah = 'surah',
  Ayah = 'ayah',
  Range = 'range',
}

const QUICK_LINKS = [
  {
    slug: 'al-mulk',
    type: QuickLinkType.Surah,
    surah: 67,
  },
  {
    slug: 'al-kahf',
    type: QuickLinkType.Surah,
    surah: 18,
  },
  {
    slug: 'ya-sin',
    type: QuickLinkType.Surah,
    surah: 36,
  },
  {
    slug: 'ayatul-kursi',
    type: QuickLinkType.Ayah,
    translationKey: 'ayat-ul-kursi',
  },
  {
    slug: 'al-baqarah',
    number: [285, 286],
    type: QuickLinkType.Range,
    surah: 2,
  },
];

const QuickLinks: React.FC = () => {
  const { t, lang } = useTranslation('quick-links');
  const chaptersData = useContext(DataContext);

  return (
    <div className={styles.container}>
      {QUICK_LINKS.map((quickLink) => {
        let text = '';
        if (quickLink.type === QuickLinkType.Ayah) {
          text = t(quickLink.translationKey);
        } else {
          const chapterData = getChapterData(chaptersData, String(quickLink.surah));
          text = `${toLocalizedNumber(quickLink.surah, lang)}. ${chapterData?.transliteratedName}`;
          if (quickLink.type === QuickLinkType.Range) {
            text = `${text} ${toLocalizedNumber(quickLink.number[0], lang)}-${toLocalizedNumber(
              quickLink.number[1],
              lang,
            )}`;
          }
        }

        return (
          <Button
            key={quickLink.slug}
            size={ButtonSize.Small}
            href={`/${
              quickLink.type === QuickLinkType.Range
                ? `${quickLink.slug}/${quickLink.number[0]}-${quickLink.number[1]}`
                : quickLink.slug
            }`}
            type={ButtonType.Primary}
            variant={ButtonVariant.Compact}
            shape={ButtonShape.Pill}
            onClick={() => {
              logButtonClick(`quick_link_${quickLink.slug}`);
            }}
            className={styles.quickLink}
          >
            <div className={styles.quickLinkText}>
              {text} <ArrowIcon />
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickLinks;
