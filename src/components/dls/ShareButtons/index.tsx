/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import {
  FacebookShareButton,
  TwitterShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share';

import styles from './ShareButtons.module.scss';

import CopyLinkIcon from '@/icons/copy-link-new.svg';
import FacebookIcon from '@/icons/fb.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  url: string;
  title: string;
  analyticsContext: string;
}

const COPY_TIMEOUT_MS = 5000;
const BG_STYLE = { fill: 'black' };

const ShareButtons: React.FC<Props> = ({ url, title, analyticsContext }) => {
  const { t } = useTranslation('common');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

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

  return (
    <div className={styles.shareOptionsButtons}>
      <div className={styles.shareOptionButton}>
        <TwitterShareButton url={url} title={title} onClick={onTwitterShareButtonClicked}>
          <div className={styles.socialIcon}>
            <XIcon size={40} round bgStyle={BG_STYLE} />
          </div>
        </TwitterShareButton>
        <span>X</span>
      </div>
      <div className={styles.shareOptionButton}>
        <FacebookShareButton url={url} title={title} onClick={onFacebookShareButtonClicked}>
          <div className={styles.utilityIconWrapper}>
            <FacebookIcon />
          </div>
        </FacebookShareButton>
        <span>Facebook</span>
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
    </div>
  );
};

export default ShareButtons;
