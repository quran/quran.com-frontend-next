import React, { useState } from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionIntro.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { logEvent } from '@/utils/eventLogger';

const PublicReflectionDescription: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('notes');

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (prev) {
        logEvent('public_reflection_intro_closed');
        return false;
      }

      logEvent('public_reflection_intro_opened');
      return true;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        {t('post-refl-intro.post-button')}
        <button type="button" onClick={toggleOpen} className={styles.learnMoreButton}>
          {isOpen ? t('new-note-reflc-intro.see-less') : t('new-note-reflc-intro.learn-more')}
        </button>
      </div>
      {isOpen && (
        <div className={styles.contentContainer}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>{t('post-refl-intro.qr-title')}</div>
            <Trans
              components={{
                li: <li key={0} />,
                link: (
                  <Link
                    key={0}
                    href="https://quranreflect.com/faq"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
              }}
              i18nKey="notes:post-refl-intro.qr-intro"
            />
          </div>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>{t('post-refl-intro.post.title')}</div>
            <ul className={styles.bulletList}>
              <Trans
                i18nKey="notes:post-refl-intro.post.desc"
                components={{
                  li: <li key={0} />,
                  link: (
                    <Link
                      key={0}
                      href="https://quranreflect.com"
                      variant={LinkVariant.Blend}
                      className={styles.link}
                      isNewTab
                    />
                  ),
                }}
              />
            </ul>
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            className={classNames(styles.learnMoreButton, styles.seeLessButton)}
          >
            {t('new-note-reflc-intro.see-less')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicReflectionDescription;
