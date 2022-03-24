/* eslint-disable max-lines */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useContext, useMemo, useState } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import truncate from 'html-truncate';
import useTranslation from 'next-translate/useTranslation';

import ChatIcon from '../../../../public/icons/chat.svg';
import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import CopyLinkIcon from '../../../../public/icons/copy-link.svg';
import CopyIcon from '../../../../public/icons/copy.svg';
import LoveIcon from '../../../../public/icons/love.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import ShareIcon from '../../../../public/icons/share.svg';
import VerifiedIcon from '../../../../public/icons/verified.svg';

import styles from './ReflectionItem.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import VerseAndTranslation from 'src/components/Verse/VerseAndTranslation';
import DataContext from 'src/contexts/DataContext';
import { getChapterData } from 'src/utils/chapter';
import { formatDateRelatively } from 'src/utils/datetime';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import {
  getQuranReflectPostCommentUrl,
  getQuranReflectAuthorUrl,
  getQuranReflectPostUrl,
  getQuranReflectTagUrl,
} from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';
import { makeVerseKey } from 'src/utils/verse';

export type VerseReference = {
  chapter: number;
  from?: number;
  to?: number;
};

type ReflectionItemProps = {
  id: number;
  authorName: string;
  authorUsername: string;
  avatarUrl: string;
  date: string;
  reflectionText: string;
  isAuthorVerified: boolean;
  verseReferences?: VerseReference[];
  likesCount?: number;
  commentsCount?: number;
};

const SEPARATOR = ' · ';
const DEFAULT_IMAGE = '/images/quran-reflect.png';
const MAX_REFLECTION_LENGTH = 220;

const hashtagRegex = /(#+[a-zA-Z0-9(_)]{1,})/;
const ReflectionItem = ({
  id,
  authorName,
  authorUsername,
  date,
  avatarUrl,
  reflectionText,
  isAuthorVerified,
  verseReferences,
  likesCount,
  commentsCount,
}: ReflectionItemProps) => {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, lang } = useTranslation();
  const formattedDate = formatDateRelatively(new Date(date), lang);
  const onMoreLessClicked = () => setIsExpanded((prevIsExpanded) => !prevIsExpanded);
  const [shouldShowReferredVerses, setShouldShowReferredVerses] = useState(false);
  const chaptersData = useContext(DataContext);

  const onReferredVersesHeaderClicked = () => {
    setShouldShowReferredVerses((prevShouldShowReferredVerses) => !prevShouldShowReferredVerses);
  };

  // some reference, are referencing to the entire chapter (doesn't have from/to properties)
  // we only want to show the data for references that have from/to properties
  const nonChapterVerseReferences = useMemo(
    () => verseReferences.filter((verse) => !!verse.from && !!verse.to),
    [verseReferences],
  );

  const referredVerseText = useMemo(() => {
    let text = '';
    const chapters = verseReferences
      .filter((verse) => !verse.from || !verse.to)
      .map((verse) => toLocalizedNumber(verse.chapter, lang));

    if (chapters.length > 0) {
      text += `${t('common:surah')} ${chapters.join(',')}`;
    }

    const verses = nonChapterVerseReferences.map((verse) =>
      makeVerseKey(
        toLocalizedNumber(verse.chapter, lang),
        toLocalizedNumber(verse.from, lang),
        toLocalizedNumber(verse.to, lang),
      ),
    );

    if (verses.length > 0) {
      if (chapters.length > 0) text += ` ${t('common:and')} `;
      text += `${t('common:ayah')} ${verses.join(',')}`;
    }

    return text;
  }, [verseReferences, nonChapterVerseReferences, lang, t]);

  const getSurahName = useCallback(
    (chapterNumber) => {
      const surahName = getChapterData(chaptersData, chapterNumber.toString())?.transliteratedName;
      return `${t('common:surah')} ${surahName} (${chapterNumber})`;
    },
    [chaptersData, t],
  );

  const onCopyLinkClicked = () => {
    logButtonClick('reflection_item_copy_link');
    clipboardCopy(getQuranReflectPostUrl(id)).then(() =>
      toast(t('common:shared'), { status: ToastStatus.Success }),
    );
  };

  const onLikesCountClicked = () => {
    logButtonClick('reflection_item_likes');
  };

  const onCommentsCountClicked = () => {
    logButtonClick('reflection_item_comments');
  };

  const onCopyTextClicked = () => {
    logButtonClick('reflection_item_copy_text');

    const textToCopy = `${reflectionText} -- ${getQuranReflectPostUrl(id)}`;
    clipboardCopy(textToCopy).then(() =>
      toast(t('quran-reader:text-copied'), { status: ToastStatus.Success }),
    );
  };

  const onReflectAuthorClicked = () => {
    logButtonClick('reflection_item_author');
  };

  const highlightHashtag = (text: string) =>
    text.replace(
      hashtagRegex,
      (val) =>
        // eslint-disable-next-line i18next/no-literal-string
        `<a target="_blank" href="${getQuranReflectTagUrl(val)}" class="${
          styles.hashtag
        }">${val}</a>`,
    );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <Link isNewTab href={getQuranReflectAuthorUrl(authorUsername)} className={styles.author}>
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
              {verseReferences && (
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

      {shouldShowReferredVerses && nonChapterVerseReferences?.length > 0 && (
        <div className={styles.verseAndTranslationsListContainer}>
          {nonChapterVerseReferences.map(({ chapter, from, to }) => (
            <div
              className={styles.verseAndTranslationContainer}
              key={makeVerseKey(chapter, from, to)}
            >
              {verseReferences.length > 1 && (
                <span className={styles.surahName}>{getSurahName(chapter)}</span>
              )}
              <VerseAndTranslation chapter={chapter} from={from} to={to} />
            </div>
          ))}
        </div>
      )}

      <span className={styles.body}>
        <span
          dangerouslySetInnerHTML={{
            __html: highlightHashtag(
              isExpanded ? reflectionText : truncate(reflectionText, MAX_REFLECTION_LENGTH),
            ),
          }}
        />
      </span>
      {reflectionText.length > MAX_REFLECTION_LENGTH && (
        <span
          className={styles.moreOrLessText}
          tabIndex={0}
          role="button"
          onKeyDown={onMoreLessClicked}
          onClick={onMoreLessClicked}
        >
          {isExpanded ? t('quran-reader:see-less') : t('quran-reader:see-more')}
        </span>
      )}
      <div className={styles.socialInteractionContainer}>
        <Button
          className={styles.actionItemContainer}
          variant={ButtonVariant.Compact}
          href={getQuranReflectPostUrl(id)}
          isNewTab
          prefix={<LoveIcon />}
          size={ButtonSize.Small}
          onClick={onLikesCountClicked}
        >
          {likesCount}
        </Button>
        <Button
          className={styles.actionItemContainer}
          variant={ButtonVariant.Compact}
          prefix={<ChatIcon />}
          href={getQuranReflectPostCommentUrl(id)}
          isNewTab
          size={ButtonSize.Small}
          onClick={onCommentsCountClicked}
        >
          {commentsCount}
        </Button>

        <PopoverMenu
          trigger={
            <Button
              className={styles.actionItemContainer}
              variant={ButtonVariant.Compact}
              size={ButtonSize.Small}
              tooltip={t('common:share')}
            >
              <ShareIcon />
            </Button>
          }
        >
          <PopoverMenu.Item
            shouldCloseMenuAfterClick
            icon={<CopyLinkIcon />}
            onClick={onCopyLinkClicked}
          >
            {t('quran-reader:copy-link')}
          </PopoverMenu.Item>
          <PopoverMenu.Item
            shouldCloseMenuAfterClick
            icon={<CopyIcon />}
            onClick={onCopyTextClicked}
          >
            {t('quran-reader:copy-text')}
          </PopoverMenu.Item>
        </PopoverMenu>
      </div>
    </div>
  );
};

export default ReflectionItem;
