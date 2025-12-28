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
    <div className={styles.container} data-testid="post-reflection-intro">
      <div className={styles.titleContainer}>
        {t('post-refl-intro.post-button')}
        <button
          type="button"
          onClick={toggleOpen}
          className={styles.learnMoreButton}
          aria-expanded={isOpen}
          aria-controls="public-reflection-description-content"
          data-testid="pr-toggle"
        >
          {isOpen ? t('new-note-reflc-intro.see-less') : t('new-note-reflc-intro.learn-more')}
        </button>
      </div>
      {isOpen && (
        <div
          className={styles.contentContainer}
          id="public-reflection-description-content"
          data-testid="pr-content"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>{t('post-refl-intro.qr-title')}</div>
            <Trans
              components={{
                link: (
                  <Link
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
                  li: <li />,
                  link: (
                    <Link
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
            aria-expanded={isOpen}
            aria-controls="public-reflection-description-content"
          >
            {t('new-note-reflc-intro.see-less')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicReflectionDescription;
