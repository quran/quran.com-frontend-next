import React, { useMemo, useState } from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './AuthorInfo.module.scss';
import buildReferredVerseText from './buildReferredVerseText';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import VerifiedIcon from '@/icons/verified.svg';
import { logErrorToSentry } from '@/lib/sentry';
import Reference from '@/types/QuranReflect/Reference';
import { formatDateRelatively } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { AUTHOR_DEFAULT_IMAGE, getImageSrc } from '@/utils/media/utils';
import { getQuranReflectAuthorUrl } from '@/utils/quranReflect/navigation';

type Props = {
  authorUsername: string;
  authorName: string;
  avatarUrl: string;
  isAuthorVerified?: boolean;
  shouldShowReferredVerses: boolean;
  date: string;
  verseReferences: Reference[];
  nonChapterVerseReferences: Reference[];
  reflectionGroup?: string;
  reflectionGroupLink?: string;
  onReferredVersesHeaderClicked: () => void;
  shouldShowFollowButton?: boolean;
  onFollow?: () => Promise<void>;
  isFollowLoading?: boolean;
};

const SEPARATOR = ' · ';

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
  shouldShowFollowButton = false,
  onFollow,
  isFollowLoading = false,
}) => {
  const { t, lang } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const formattedDate = formatDateRelatively(new Date(date), lang);
  const referredVerseText = useMemo(
    () => buildReferredVerseText(verseReferences, nonChapterVerseReferences, lang, t),
    [verseReferences, nonChapterVerseReferences, lang, t],
  );
  const onFollowClicked = () => {
    if (!onFollow || isFollowLoading) return;
    onFollow().catch((caughtError) => {
      logErrorToSentry(caughtError, { transactionName: 'quranReflectFollowClick' });
    });
  };

  return (
    <div className={styles.authorInfo}>
      <Link isNewTab href={getQuranReflectAuthorUrl(authorUsername)} className={styles.author}>
        <Image
          alt={authorName}
          className={styles.avatar}
          src={imageError ? AUTHOR_DEFAULT_IMAGE : getImageSrc(avatarUrl)}
          width={40}
          height={40}
          onError={() => setImageError(true)}
        />
      </Link>
      <div>
        <div className={styles.authorRow}>
          <Link
            isNewTab
            href={getQuranReflectAuthorUrl(authorUsername)}
            variant={LinkVariant.Primary}
            className={styles.author}
            onClick={() => logButtonClick('reflection_item_author')}
          >
            {authorName}
            {isAuthorVerified && (
              <span className={styles.verifiedIcon}>
                <VerifiedIcon />
              </span>
            )}
          </Link>
          {shouldShowFollowButton && onFollow && (
            <Button
              size={ButtonSize.XSmall}
              type={ButtonType.Success}
              variant={ButtonVariant.Compact}
              className={styles.followButton}
              contentClassName={styles.followButtonContent}
              isDisabled={isFollowLoading}
              isLoading={isFollowLoading}
              onClick={onFollowClicked}
            >
              {t('quran-reader:reflection-feed.follow')}
            </Button>
          )}
        </div>
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
