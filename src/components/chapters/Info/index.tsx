/* eslint-disable react/no-danger */

import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import BackIcon from '../../../../public/icons/west.svg';

import styles from './Info.module.scss';

import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { getBlurDataUrl } from 'src/utils/image';
import { toLocalizedNumber } from 'src/utils/locale';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import Chapter from 'types/Chapter';
import ChapterInfo from 'types/ChapterInfo';

interface Props {
  chapter?: Chapter;
  chapterInfo?: ChapterInfo;
}

const Info: React.FC<Props> = ({ chapter, chapterInfo }) => {
  const { t, lang } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.infoBody}>
        <div>
          <div className={styles.backContainer}>
            <Button
              variant={ButtonVariant.Ghost}
              href={getSurahNavigationUrl(chapterInfo.chapterId)}
              className={styles.backIcon}
              prefix={<BackIcon />}
              size={ButtonSize.Small}
            >
              {t('surah-info:go-to-surah')}
            </Button>
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={`/images/${chapter.revelationPlace}.jpg`}
              layout="fill"
              placeholder="blur"
              blurDataURL={getBlurDataUrl(200, 250)}
            />
          </div>
        </div>
        <div className={styles.infoTextContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.surahName}>
              {t('common:surah')} {chapter.transliteratedName}
            </div>
            <div className={styles.detailsContainer}>
              <div>
                <p className={styles.detailHeader}>{t('common:ayahs')}</p>
                <p>{toLocalizedNumber(chapter.versesCount, lang)}</p>
              </div>
              <div>
                <p className={styles.detailHeader}>{t('surah-info:revelation-place')}</p>
                <p>{t(`surah-info:${chapter.revelationPlace}`)}</p>
              </div>
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: chapterInfo.text }} className={styles.textBody} />
        </div>
      </div>
    </div>
  );
};

export default Info;
