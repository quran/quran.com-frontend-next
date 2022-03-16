/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import VerifiedIcon from '../../../../public/icons/verified.svg';

import styles from './ReflectionItem.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import VerseAndTranslation from 'src/components/Verse/VerseAndTranslation';
import { getChapterData } from 'src/utils/chapter';
import { formatDateRelatively } from 'src/utils/datetime';
import { getQuranReflectPostUrl } from 'src/utils/navigation';
import { truncateString } from 'src/utils/string';
import { navigateToExternalUrl } from 'src/utils/url';
import { getChapterNumberFromKey, getVerseNumberFromKey } from 'src/utils/verse';

type ReflectionItemProps = {
  id: number;
  authorName: string;
  avatarUrl: string;
  date: string;
  reflectionText: string;
  isAuthorVerified: boolean;
  referredVerseKeys?: string[];
};

const SEPARATOR = ' · ';
const DEFAULT_IMAGE = '/images/quran-reflect.png';
const MAX_REFLECTION_LENGTH = 220;
const ReflectionItem = ({
  id,
  authorName,
  date,
  avatarUrl,
  reflectionText,
  isAuthorVerified,
  referredVerseKeys,
}: ReflectionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, lang } = useTranslation();
  const formattedDate = formatDateRelatively(new Date(date), lang);
  const onMoreLessClicked = () => setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  const [shouldShowReferredVerses, setShouldShowReferredVerses] = useState(false);

  const onReferredVersesHeaderClicked = () => {
    setShouldShowReferredVerses((prevShouldShowReferredVerses) => !prevShouldShowReferredVerses);
  };

  // temporary solution to hide verse that's referring the entire chapter
  // TODO: filter this the API level
  if (referredVerseKeys && referredVerseKeys.find((verseKey) => !getVerseNumberFromKey(verseKey)))
    return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <img alt={authorName} className={styles.avatar} src={avatarUrl || DEFAULT_IMAGE} />
          <div>
            <div className={styles.author}>
              {authorName}
              {isAuthorVerified && (
                <span className={styles.verifiedIcon}>
                  <VerifiedIcon />
                </span>
              )}
            </div>
            <div>
              <span className={styles.date}>{formattedDate}</span>
              {referredVerseKeys && (
                <>
                  <span className={styles.separator}>{SEPARATOR}</span>
                  <span
                    tabIndex={0}
                    role="button"
                    onKeyPress={onReferredVersesHeaderClicked}
                    onClick={onReferredVersesHeaderClicked}
                    className={styles.referredVerses}
                  >
                    {t('quran-reader:referring-verses')} {referredVerseKeys.join(',')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <PopoverMenu
            trigger={
              <Button
                size={ButtonSize.Small}
                tooltip={t('common:more')}
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
              >
                <OverflowMenuIcon />
              </Button>
            }
          >
            <PopoverMenu.Item
              onClick={() => {
                navigateToExternalUrl(getQuranReflectPostUrl(id));
              }}
            >
              {t('quran-reader:view-on-quran-reflect')}
            </PopoverMenu.Item>
          </PopoverMenu>
        </div>
      </div>
      <div>
        {shouldShowReferredVerses &&
          referredVerseKeys &&
          referredVerseKeys.map((verseKey) => (
            <div className={styles.verseAndTranslationContainer} key={verseKey}>
              {referredVerseKeys.length > 1 && (
                <span className={styles.surahName}>
                  {t('surah')}{' '}
                  {getChapterData(getChapterNumberFromKey(verseKey).toString()).transliteratedName}{' '}
                  ({getChapterNumberFromKey(verseKey)})
                </span>
              )}
              <VerseAndTranslation verseKey={verseKey} />
            </div>
          ))}
        <span className={styles.body}>
          {isExpanded ? reflectionText : truncateString(reflectionText, MAX_REFLECTION_LENGTH)}
        </span>
        {reflectionText.length > MAX_REFLECTION_LENGTH && (
          <span
            className={styles.moreOrLessText}
            tabIndex={0}
            role="button"
            onKeyDown={onMoreLessClicked}
            onClick={onMoreLessClicked}
          >
            {isExpanded ? t('less') : t('more')}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReflectionItem;
