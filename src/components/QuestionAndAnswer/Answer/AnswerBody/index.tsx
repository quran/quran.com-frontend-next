/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './AnswerBody.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ShareButtons from '@/dls/ShareButtons';
import ShareIcon from '@/icons/share.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuestionNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

type Props = {
  question: Question;
};

const AnswerBody: React.FC<Props> = ({ question }) => {
  const [shouldShowShareOptions, setShouldShowShareOptions] = useState(false);
  const { t } = useTranslation('quran-reader');

  const onShareButtonClick = () => {
    logButtonClick('q_and_a_answer_share_button');
    setShouldShowShareOptions(true);
  };

  const shareURL = `${getBasePath()}${getQuestionNavigationUrl(question.id)}`;
  const title = t('q-and-a.explore_answers');

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
        <ShareButtons url={shareURL} title={title} analyticsContext="q_and_a_answer" />
      )}
    </>
  );
};

export default AnswerBody;
