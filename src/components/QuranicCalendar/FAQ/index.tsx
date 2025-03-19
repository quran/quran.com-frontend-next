import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './FAQ.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import QuestionIcon from '@/icons/question.svg';

const FAQ: React.FC = () => {
  const { t } = useTranslation('quranic-calendar');
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  // Get FAQ items from translations
  const faqItemsData = t('faq-items', {}, { returnObjects: true });

  // Ensure faqItems is an array
  const faqItems = Array.isArray(faqItemsData)
    ? (faqItemsData as { question: string; answer: string }[])
    : []; // Fallback to empty array if not an array

  const toggleItem = (id: number) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('faq')}</h2>

      <div className={styles.faqList}>
        {faqItems.length > 0 ? (
          faqItems.map((item, index) => {
            // Create a stable key based on the question content
            const itemKey = `faq-item-${item.question
              .slice(0, 10)
              .replace(/\s+/g, '-')
              .toLowerCase()}`;

            return (
              <div
                key={itemKey}
                className={`${styles.faqItem} ${openItemId === index ? styles.open : ''}`}
              >
                <div
                  className={styles.faqQuestion}
                  onClick={() => toggleItem(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleItem(index);
                    }
                  }}
                >
                  <div className={styles.questionContent}>
                    <QuestionIcon className={styles.questionIcon} />
                    <span>{item.question}</span>
                  </div>
                  <ChevronDownIcon className={styles.chevronIcon} />
                </div>
                {openItemId === index && <div className={styles.faqAnswer}>{item.answer}</div>}
              </div>
            );
          })
        ) : (
          <div className={styles.noFaqItems}>No FAQ items available.</div>
        )}
      </div>
    </div>
  );
};

export default FAQ;
