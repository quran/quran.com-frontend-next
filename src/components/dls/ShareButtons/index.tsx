/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import {
  FacebookShareButton,
  TwitterShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share';

import styles from './ShareButtons.module.scss';

import { getMushafFromQuranFont } from '@/components/AyahWidget/widget-defaults';
import { buildSimpleEmbedSnippet } from '@/components/AyahWidget/widget-embed';
import useThemeDetector from '@/hooks/useThemeDetector';
import CodeCircleIcon from '@/icons/code-circle.svg';
import CopyLinkIcon from '@/icons/copy-link-new.svg';
import FacebookIcon from '@/icons/fb.svg';
import VideoIcon from '@/public/icons/video-link-new.svg';
import { selectAyahWidgetOverrides } from '@/redux/slices/ayahWidget';
import { selectQuranFont } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import PreviewMode from '@/types/Media/PreviewMode';
import QueryParam from '@/types/QueryParam';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranMediaMakerNavigationUrl } from '@/utils/navigation';

interface Props {
  url: string;
  title: string;
  analyticsContext: string;
  verse?: {
    chapterId?: string;
    verseNumber?: number;
  };
}

const COPY_TIMEOUT_MS = 5000;
const BG_STYLE = { fill: 'black' };

const ShareButtons: React.FC<Props> = ({ url, title, analyticsContext, verse }) => {
  const { t } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);
  const [isEmbedCopied, setIsEmbedCopied] = useState(false);

  // QDC preferences (needed to build embed snippet)
  const widgetOverrides = useSelector(selectAyahWidgetOverrides);
  const { themeVariant } = useThemeDetector();
  const qdcTranslations = useSelector(selectSelectedTranslations);
  const qdcQuranFont = useSelector(selectQuranFont);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isEmbedCopied === true) {
      timeoutId = setTimeout(() => setIsEmbedCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isEmbedCopied]);

  const onCopyLinkClicked = () => {
    logButtonClick(`${analyticsContext}_copy_link`);
    clipboardCopy(url).then(() => {
      setIsCopied(true);
    });
  };

  const onTwitterShareButtonClicked = () => {
    logButtonClick(`${analyticsContext}_twitter_share`);
  };

  const onFacebookShareButtonClicked = () => {
    logButtonClick(`${analyticsContext}_facebook_share`);
  };

  const onWhatsappShareButtonClicked = () => {
    logButtonClick(`${analyticsContext}_whatsapp_share`);
  };

  const onCopyEmbedClicked = () => {
    logButtonClick(`${analyticsContext}_copy_embed`);

    // Merge QDC preferences with any explicit widget overrides
    const embedPrefs = {
      theme: themeVariant,
      mushaf: getMushafFromQuranFont(qdcQuranFont),
      translationIds: qdcTranslations,
      ...widgetOverrides,
    };
    const embedCode = buildSimpleEmbedSnippet(
      Number(verse.chapterId),
      verse.verseNumber,
      embedPrefs,
    );
    clipboardCopy(embedCode).then(() => {
      setIsEmbedCopied(true);
    });
  };

  const router = useRouter();

  const onGenerateClicked = () => {
    logButtonClick(`${analyticsContext}_generate_media`);
    if (verse?.chapterId && verse?.verseNumber) {
      router.push(
        getQuranMediaMakerNavigationUrl({
          [QueryParam.SURAH]: verse.chapterId,
          [QueryParam.VERSE_FROM]: String(verse.verseNumber),
          [QueryParam.VERSE_TO]: String(verse.verseNumber),
          [QueryParam.PREVIEW_MODE]: PreviewMode.DISABLED,
        }),
      );
    } else {
      router.push(getQuranMediaMakerNavigationUrl());
    }
  };

  return (
    <div className={styles.shareOptionsButtons}>
      <div className={styles.shareOptionButton}>
        <FacebookShareButton url={url} title={title} onClick={onFacebookShareButtonClicked}>
          <div className={styles.utilityIconWrapper}>
            <FacebookIcon />
          </div>
        </FacebookShareButton>
        <span>Facebook</span>
      </div>
      <div className={styles.shareOptionButton}>
        <TwitterShareButton url={url} title={title} onClick={onTwitterShareButtonClicked}>
          <div className={styles.socialIcon}>
            <XIcon size={40} round bgStyle={BG_STYLE} />
          </div>
        </TwitterShareButton>
        <span>X</span>
      </div>
      <div className={styles.shareOptionButton}>
        <WhatsappShareButton url={url} title={title} onClick={onWhatsappShareButtonClicked}>
          <div className={styles.socialIcon}>
            <WhatsappIcon size={40} round bgStyle={BG_STYLE} />
          </div>
        </WhatsappShareButton>
        <span>Whatsapp</span>
      </div>
      <button type="button" className={styles.shareOptionButton} onClick={onCopyLinkClicked}>
        <div className={styles.utilityIconWrapper}>
          <CopyLinkIcon />
        </div>
        <span>{isCopied ? `${t('copied')}!` : t('copylink')}</span>
      </button>

      {verse?.chapterId && verse?.verseNumber && (
        <button type="button" className={styles.shareOptionButton} onClick={onCopyEmbedClicked}>
          <div className={styles.socialIcon}>
            <CodeCircleIcon />
          </div>
          <span>{isEmbedCopied ? `${t('embed-copied')}!` : t('copy-embed')}</span>
        </button>
      )}

      <button
        type="button"
        className={classNames(styles.shareOptionButton, styles.generateMediaButton)}
        onClick={onGenerateClicked}
      >
        <div className={styles.utilityIconWrapper}>
          <VideoIcon />
        </div>
        <span>{t('quran-reader:generate-media')}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
