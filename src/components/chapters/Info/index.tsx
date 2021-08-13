/* eslint-disable react/no-danger */
import React from 'react';
import Chapter from 'types/Chapter';
import _ from 'lodash';
import ChapterInfo from 'types/ChapterInfo';
import Image from 'next/image';
import { getBlurDataUrl } from 'src/utils/image';
import styles from './Info.module.scss';

interface Props {
  chapter?: Chapter;
  chapterInfo?: ChapterInfo;
}

const Info: React.FC<Props> = ({ chapter, chapterInfo }) => (
  <div className={styles.container}>
    <div className={styles.infoBody}>
      <div className={styles.imageContainer}>
        <Image
          src={`/images/${chapter.revelationPlace}.jpg`}
          layout="fill"
          placeholder="blur"
          blurDataURL={getBlurDataUrl(200, 250)}
        />
      </div>
      <div className={styles.infoTextContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.surahName}>Surah {chapter.nameSimple}</div>
          <div className={styles.detailsContainer}>
            <div>
              <p className={styles.detailHeader}>Ayahs</p>
              <p>{chapter.versesCount}</p>
            </div>
            <div>
              <p className={styles.detailHeader}>Pages</p>
              <p>
                {chapter.pages[0]}-{chapter.pages[1]}
              </p>
            </div>
            <div>
              <p className={styles.detailHeader}>Revelation Place</p>
              <p>{_.capitalize(chapter.revelationPlace)}</p>
            </div>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: chapterInfo.text }} />
      </div>
    </div>
  </div>
);

export default Info;
