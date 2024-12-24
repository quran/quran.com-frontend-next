import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './AnswerBody.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ShareIcon from '@/icons/share.svg';
import { Question } from '@/types/QuestionsAndAnswers/Question';

type Props = {
  question: Question;
};

const AnswerBody: React.FC<Props> = ({ question }) => {
  const { t } = useTranslation('quran-reader');
  return (
    <>
      <div className={styles.answerBody}>
        <p className={styles.header}>{t('q-and-a.answer')}</p>
        <div className={styles.text}>{question?.answers[0]?.body}</div>
        {question?.summary && (
          <>
            <p className={styles.header}>{t('q-and-a.summary')}</p>
            <div className={styles.text}>{question?.summary}</div>
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
        <Button variant={ButtonVariant.Compact} size={ButtonSize.Small}>
          <div className={styles.shareButtonText}>
            <ShareIcon /> {t('common:share')}
          </div>
        </Button>
      </div>
    </>
  );
};

export default AnswerBody;
