/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import styles from './ReflectionItem.module.scss';

import { truncateString } from 'src/utils/string';

type ReflectionItemProps = {
  authorName: string;
  avatarUrl: string;
  date: string;
  reflectionText: string;
};

const ReflectionItem = ({ authorName, date, avatarUrl, reflectionText }: ReflectionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {avatarUrl && <img alt={authorName} className={styles.avatar} src={avatarUrl} />}
        </div>
        <div>
          <div className={styles.author}>{authorName}</div>
          <div className={styles.date}>{date}</div>
        </div>
      </div>
      <div>
        <span className={styles.body}>
          {isExpanded ? reflectionText : truncateString(reflectionText, 220)}
        </span>
        <span
          className={styles.moreOrLessText}
          tabIndex={0}
          role="button"
          onKeyDown={() => setIsExpanded(!isExpanded)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'less' : 'more'}
        </span>
      </div>
    </div>
  );
};

export default ReflectionItem;
