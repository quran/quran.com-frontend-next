/* eslint-disable max-lines */
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import { PlayerRef } from '@remotion/player';
import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from './RenderControls.module.scss';
import RenderImageButton from './RenderImageButton';
import RenderVideoButton from './RenderVideoButton';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import CopyLinkIcon from '@/icons/copy-link.svg';
import CopyIcon from '@/icons/copy.svg';
import layoutStyle from '@/pages/index.module.scss';
import PreviewMode from '@/types/Media/PreviewMode';
import QueryParam from '@/types/QueryParam';
import { shortenUrl } from '@/utils/auth/api';
import { isSafari } from '@/utils/device-detector';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranMediaMakerNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

type Props = {
  inputProps: MediaFileCompositionProps;
  isFetching: boolean;
  playerRef: MutableRefObject<PlayerRef>;
};

export type MediaFileCompositionProps = {
  video: object;
  verses: object;
  audio: object;
  timestamps: object;
  fontColor: any;
  verseAlignment: string;
  translationAlignment: string;
  border: string;
};

const COPY_TIMEOUT_MS = 3000;

const RenderControls: React.FC<Props> = ({ inputProps, isFetching, playerRef }) => {
  const { t } = useTranslation('media');
  const [isCopied, setIsCopied] = useState(false);
  const [urlGenerated, setUrlGenerated] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const isSafariBrowser = typeof window !== 'undefined' ? isSafari() : false;

  // Store the URL search params at the time of link generation
  const lastUrlParamsRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isCopied) {
      timeoutId = setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  // Set up a listener for URL changes
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return undefined;

    // Function to handle URL changes
    const handleUrlChange = () => {
      if (urlGenerated && lastUrlParamsRef.current) {
        const currentUrlParams = window.location.search;

        // If URL parameters have changed, reset the link state
        if (currentUrlParams !== lastUrlParamsRef.current) {
          setUrlGenerated(false);
          setShareUrl('');
        }
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);

    // Set up an interval to poll for URL changes
    // This is needed because query parameter changes might not trigger popstate
    const intervalId = setInterval(handleUrlChange, 500);

    return (): void => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(intervalId);
    };
  }, [urlGenerated]);

  /**
   * Generates a shareable URL for the current media state
   * @returns {Promise<string>} The generated URL
   */
  const generateShareableUrl = async (): Promise<string> => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    url.searchParams.set(QueryParam.PREVIEW_MODE, PreviewMode.ENABLED);

    let finalUrl = url.toString();

    try {
      const response = await shortenUrl(finalUrl);
      if (response?.id) {
        finalUrl = `${getBasePath()}${getQuranMediaMakerNavigationUrl()}/${response.id}`;
      }
    } catch (error) {
      // If shortening fails, continue with the full URL
    }

    return finalUrl;
  };

  /**
   * Creates a full URL with preview mode enabled as a fallback
   * @returns {string} The full URL with preview mode
   */
  const createFullUrlWithPreview = (): string => {
    const fullUrl = new URL(window.location.href);
    fullUrl.searchParams.set(QueryParam.PREVIEW_MODE, PreviewMode.ENABLED);
    return fullUrl.toString();
  };

  /**
   * Handles generating the shareable link
   * On Safari, just generates and displays the URL
   */
  const onGenerateLinkClicked = async () => {
    logButtonClick('video_generation_generate_link');

    try {
      const finalUrl = await generateShareableUrl();
      setShareUrl(finalUrl);
      setUrlGenerated(true);
      lastUrlParamsRef.current = window.location.search;
    } catch (error) {
      // On error, fallback to using the full URL
      setShareUrl(createFullUrlWithPreview());
      setUrlGenerated(true);
      lastUrlParamsRef.current = window.location.search;
    }
  };

  /**
   * Handles getting the URL to copy - either from existing share URL or generating a new one
   * @returns {Promise<string>} The URL to be copied
   */
  const getUrlToCopy = async (): Promise<string> => {
    if (isSafariBrowser && urlGenerated) {
      return shareUrl;
    }
    try {
      return await generateShareableUrl();
    } catch (error) {
      return createFullUrlWithPreview();
    }
  };

  /**
   * Handles copying the media share URL to clipboard
   * Different behavior for Safari vs other browsers:
   * - Safari: copies the previously generated URL
   * - Other browsers: generates and copies in one step
   */
  const onCopyLinkClicked = async () => {
    logButtonClick('video_generation_copy_link');

    try {
      const urlToCopy = await getUrlToCopy();

      setShareUrl(urlToCopy);
      if (isSafariBrowser && !urlGenerated) {
        setUrlGenerated(true);
        lastUrlParamsRef.current = window.location.search;
      }

      await clipboardCopy(urlToCopy);
      setIsCopied(true);
    } catch (error) {
      // If clipboard operation fails on Safari, ensure URL is displayed
      if (isSafariBrowser && !urlGenerated) {
        try {
          const fallbackUrl = await generateShareableUrl();
          setShareUrl(fallbackUrl);
        } catch (genError) {
          // Ultimate fallback - just use the raw URL
          setShareUrl(createFullUrlWithPreview());
        }

        setUrlGenerated(true);
        lastUrlParamsRef.current = window.location.search;
      }
    }
  };

  return (
    <div className={classNames(layoutStyle.flowItem, layoutStyle.fullWidth, styles.container)}>
      <div>
        <h2 className={styles.lineBackground}>
          <span>{t('download-share')}</span>
        </h2>
      </div>

      <div className={styles.controlsContainer}>
        <RenderVideoButton isFetching={isFetching} inputProps={inputProps} />
        <RenderImageButton isFetching={isFetching} inputProps={inputProps} playerRef={playerRef} />

        {/* For Safari: Show Generate Link button */}
        {isSafariBrowser && (
          <Button
            className={styles.copyButton}
            type={ButtonType.Secondary}
            prefix={<CopyLinkIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateLinkClicked();
            }}
          >
            {t('generate-link')}
          </Button>
        )}

        {/* For non-Safari browsers: Show only Copy Link button */}
        {!isSafariBrowser && (
          <Button
            className={styles.copyButton}
            type={ButtonType.Secondary}
            prefix={<CopyIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onCopyLinkClicked();
            }}
          >
            {isCopied ? t('copied') : t('copy-link')}
          </Button>
        )}

        {/* URL display box with copy button for Safari */}
        {urlGenerated && isSafariBrowser && (
          <div className={styles.urlDisplayContainer}>
            <div className={styles.urlDisplayHeader}>
              <p>{t('your-link')}</p>
              <Button
                className={styles.copyButton}
                prefix={<CopyIcon />}
                type={ButtonType.Secondary}
                size={ButtonSize.Small}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyLinkClicked();
                }}
              >
                {isCopied ? t('copied') : t('copy-link')}
              </Button>
            </div>
            <div className={styles.urlBox}>{shareUrl}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenderControls;
