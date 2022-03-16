/* eslint-disable max-lines */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
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

  const validReferredVerseKeys = useMemo(
    () => referredVerseKeys?.filter((key) => key !== '' && !!getVerseNumberFromKey(key)),
    [referredVerseKeys],
  );

  const referredVerseText = useMemo(() => {
    let text = 'referring ';
    const chapters = referredVerseKeys
      .filter((key) => !getVerseNumberFromKey(key))
      .map(getChapterNumberFromKey);

    if (chapters.length > 0) {
      text += `${t('common:surah')} ${chapters.join(',')}`;
    }

    if (validReferredVerseKeys.length > 0) {
      if (chapters.length > 0) text += ` ${t('common:and')} `;
      text += `${t('common:ayah')} ${validReferredVerseKeys.join(',')}`;
    }

    return text;
  }, [referredVerseKeys, t, validReferredVerseKeys]);

  const getSurahName = useCallback(
    (verseKey) => {
      const chapterNumber = getChapterNumberFromKey(verseKey);
      const surahName = getChapterData(chapterNumber.toString())?.transliteratedName;
      return `${t('common:surah')} ${surahName} (${chapterNumber})
      `;
    },
    [t],
  );

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
                    className={classNames(styles.referredVerses, {
                      [styles.clickable]: validReferredVerseKeys.length > 0,
                    })}
                  >
                    {referredVerseText}
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
          validReferredVerseKeys?.map((verseKey) => (
            <div className={styles.verseAndTranslationContainer} key={verseKey}>
              {validReferredVerseKeys.length > 1 && (
                <span className={styles.surahName}>{getSurahName(verseKey)}</span>
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
