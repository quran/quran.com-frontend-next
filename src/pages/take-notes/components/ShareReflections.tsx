import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import BenefitSection from './BenefitSection';

import styles from '@/pages/contentPage.module.scss';
import { logButtonClick } from '@/utils/eventLogger';

const ShareReflections: React.FC = () => {
  const { t } = useTranslation('take-notes');

  const onLinkClicked = (section: string) => {
    logButtonClick(`${section}_take_notes_link`);
  };

  return (
    <BenefitSection id="share-reflections" number={5} title={t('benefits.share-reflections.title')}>
      <p>
        <Trans
          i18nKey="benefits.share-reflections.paragraph1"
          components={[
            <a
              href="https://quranreflect.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClicked('quranreflect')}
              key={0}
              aria-label="QuranReflect"
            />,
          ]}
          ns="take-notes"
        />
      </p>
      <p>{t('benefits.share-reflections.paragraph2')}</p>
      <p className={styles.centeredText}>
        <i>{t('benefits.share-reflections.quote')}</i>
      </p>
      <p>{t('benefits.share-reflections.reflection-prompt')}</p>
      <ul>
        {[
          { id: 'verse', text: t('benefits.share-reflections.reflection-questions.0') },
          { id: 'impact', text: t('benefits.share-reflections.reflection-questions.1') },
          { id: 'application', text: t('benefits.share-reflections.reflection-questions.2') },
        ].map(({ id, text }) => (
          <li key={`rq-${id}`}>{text}</li>
        ))}
      </ul>
      <div className={styles.spacer} />
      <p>{t('benefits.share-reflections.deeper-insights-title')}</p>
      <ul>
        {[
          { id: 'perspective', text: t('benefits.share-reflections.deeper-insights.0') },
          { id: 'knowledge', text: t('benefits.share-reflections.deeper-insights.1') },
          { id: 'community', text: t('benefits.share-reflections.deeper-insights.2') },
        ].map(({ id, text }) => (
          <li key={`di-${id}`}>{text}</li>
        ))}
      </ul>
      <div className={styles.spacer} />
      <p>
        <Trans
          i18nKey="benefits.share-reflections.community-paragraph"
          components={[
            <a
              href="https://quranreflect.com/faq"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClicked('quranreflect_faq')}
              key={0}
              aria-label="QuranReflect FAQ"
            >
              QuranReflect FAQ
            </a>,
            <a
              href="https://quran.com/learning-plans/five-lenses-to-reflect-on-the-quran"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClicked('five_lenses')}
              key={1}
              aria-label="Five Lenses to Reflect on the Quran"
            >
              Five Lenses
            </a>,
          ]}
          ns="take-notes"
        />
      </p>
    </BenefitSection>
  );
};

export default ShareReflections;
