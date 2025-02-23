/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from 'react';

import { MilkdownProvider } from '@milkdown/react';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';
import {
  FacebookShareButton,
  TwitterShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share';

import styles from './AnswerBody.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CopyLinkIcon from '@/icons/copy-link-new.svg';
import FacebookIcon from '@/icons/fb.svg';
import ShareIcon from '@/icons/share.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuestionNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

type Props = {
  question: Question;
};

const COPY_TIMEOUT_MS = 5000;
const BG_STYLE = { fill: 'black' };

const AnswerBody: React.FC<Props> = ({ question }) => {
  const [shouldShowShareOptions, setShouldShowShareOptions] = useState(false);
  const { t } = useTranslation('quran-reader');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // if the user has just copied the text, we should change the text back to Copy after 3 seconds.
    if (isCopied === true) {
      timeoutId = setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCopied]);

  const onShareButtonClick = () => {
    logButtonClick('q_and_a_answer_share_button');
    setShouldShowShareOptions(true);
  };

  const shareURL = `${getBasePath()}${getQuestionNavigationUrl(question.id)}`;
  const title = t('q-and-a.explore_answers');

  const onCopyLinkClicked = () => {
    logButtonClick('q_and_a_answer_copy_link');
    clipboardCopy(shareURL).then(() => {
      setIsCopied(true);
    });
  };

  const onTwitterShareButtonClicked = () => {
    logButtonClick('q_and_a_answer_twitter_share');
  };

  const onFacebookShareButtonClicked = () => {
    logButtonClick('q_and_a_answer_facebook_share');
  };

  const onWhatsappShareButtonClicked = () => {
    logButtonClick('q_and_a_answer_whatsapp_share');
  };

  return (
    <>
      <div className={styles.answerBody}>
        <p className={styles.header}>{t('q-and-a.answer')}</p>
        <MilkdownProvider>
          <MarkdownEditor isEditable={false} defaultValue={question?.answers[0]?.body} />
        </MilkdownProvider>
        {question?.summary && (
          <>
            <p className={styles.header}>{t('q-and-a.summary')}</p>
            <MilkdownProvider>
              <MarkdownEditor isEditable={false} defaultValue={question?.summary} />
            </MilkdownProvider>
          </>
        )}
        {question?.references && (
          <>
            <p className={styles.header}>{t('q-and-a.references')}</p>
            {question?.references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </>
        )}
      </div>
      <div className={styles.shareButton}>
        <Button
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          onClick={onShareButtonClick}
        >
          <div className={styles.shareButtonText}>
            <ShareIcon /> {t('common:share')}
          </div>
        </Button>
      </div>
      {shouldShowShareOptions && (
        <div className={styles.shareOptions}>
          <div className={styles.shareOptionsButtons}>
            <div className={styles.shareOptionButton}>
              <TwitterShareButton
                url={shareURL}
                title={title}
                onClick={onTwitterShareButtonClicked}
              >
                <div className={styles.socialIcon}>
                  <XIcon size={40} round bgStyle={BG_STYLE} />
                </div>
              </TwitterShareButton>
              <span>X</span>
            </div>
            <div className={styles.shareOptionButton}>
              <FacebookShareButton
                url={shareURL}
                title={title}
                onClick={onFacebookShareButtonClicked}
              >
                <div className={styles.utilityIconWrapper}>
                  <FacebookIcon />
                </div>
              </FacebookShareButton>
              <span>Facebook</span>
            </div>
            <div className={styles.shareOptionButton}>
              <WhatsappShareButton
                url={shareURL}
                title={title}
                onClick={onWhatsappShareButtonClicked}
              >
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
              <span>{isCopied ? `${t('common:copied')}!` : t('cpy-link')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AnswerBody;
