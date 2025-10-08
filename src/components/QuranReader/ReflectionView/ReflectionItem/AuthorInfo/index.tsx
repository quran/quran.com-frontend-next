import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './AuthorInfo.module.scss';
import buildReferredVerseText from './buildReferredVerseText';

import Link, { LinkVariant } from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import VerifiedIcon from '@/icons/verified.svg';
import Reference from '@/types/QuranReflect/Reference';
import { formatDateRelatively } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranReflectAuthorUrl } from '@/utils/quranReflect/navigation';

type Props = {
  authorUsername: string;
  authorName: string;
  avatarUrl: string;
  isAuthorVerified: boolean;
  shouldShowReferredVerses: boolean;
  date: string;
  verseReferences: Reference[];
  nonChapterVerseReferences: Reference[];
  reflectionGroup?: string;
  reflectionGroupLink?: string;
  onReferredVersesHeaderClicked: () => void;
};

const SEPARATOR = ' · ';
const DEFAULT_IMAGE = '/images/quran-reflect.png';

const AuthorInfo: React.FC<Props> = ({
  authorUsername,
  authorName,
  avatarUrl,
  date,
  isAuthorVerified,
  verseReferences,
  nonChapterVerseReferences,
  onReferredVersesHeaderClicked,
  shouldShowReferredVerses,
  reflectionGroup,
  reflectionGroupLink,
}) => {
  const { t, lang } = useTranslation();
  const formattedDate = formatDateRelatively(new Date(date), lang);

  const onReflectAuthorClicked = () => {
    logButtonClick('reflection_item_author');
  };

  const referredVerseText = useMemo(
    () => buildReferredVerseText(verseReferences, nonChapterVerseReferences, lang, t),
    [verseReferences, nonChapterVerseReferences, lang, t],
  );

  return (
    <div className={styles.authorInfo}>
      <Link isNewTab href={getQuranReflectAuthorUrl(authorUsername)} className={styles.author}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={authorName} className={styles.avatar} src={avatarUrl || DEFAULT_IMAGE} />
      </Link>
      <div>
        <Link
          isNewTab
          href={getQuranReflectAuthorUrl(authorUsername)}
          variant={LinkVariant.Primary}
          className={styles.author}
          onClick={onReflectAuthorClicked}
        >
          {authorName}
          {isAuthorVerified && (
            <span className={styles.verifiedIcon}>
              <VerifiedIcon />
            </span>
          )}
        </Link>
        <div>
          <span className={styles.date}>{formattedDate}</span>
          {verseReferences.length !== 0 && (
            <>
              <span className={styles.separator}>{SEPARATOR}</span>
              <span
                tabIndex={0}
                role="button"
                onKeyPress={onReferredVersesHeaderClicked}
                onClick={onReferredVersesHeaderClicked}
                className={classNames(styles.verseReferencesContainer, {
                  [styles.clickable]: nonChapterVerseReferences.length > 0,
                })}
              >
                <span className={styles.referencedVersesPrefix}>
                  {t('quran-reader:referencing')}{' '}
                </span>
                <span className={styles.verseReferences}>{referredVerseText}</span>
                <span
                  className={classNames(styles.chevronContainer, {
                    [styles.flipChevron]: shouldShowReferredVerses,
                  })}
                >
                  {nonChapterVerseReferences.length > 0 && <ChevronDownIcon />}
                </span>
              </span>
            </>
          )}
        </div>
        {reflectionGroup && (
          <div className={styles.groupContainer}>
            <p className={styles.postedIn}>{t('quran-reader:posted-in')}</p>
            <Link isNewTab href={reflectionGroupLink}>
              <p className={styles.groupName}>{reflectionGroup}</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorInfo;
