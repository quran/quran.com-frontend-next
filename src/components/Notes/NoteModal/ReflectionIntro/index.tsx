import React, { useState } from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionIntro.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { logEvent } from '@/utils/eventLogger';

const ReflectionIntro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('notes');

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (prev) {
        logEvent('new_note_reflection_intro_closed');
        return false;
      }

      logEvent('new_note_reflection_intro_opened');
      return true;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        {t('new-note-reflc-intro.title')}
        <button type="button" onClick={toggleOpen} className={styles.learnMoreButton}>
          {isOpen ? t('new-note-reflc-intro.see-less') : t('new-note-reflc-intro.learn-more')}
        </button>
      </div>
      {isOpen && (
        <div className={styles.contentContainer}>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              {t('new-note-reflc-intro.what-is-reflc.title')}
            </div>
            <Trans
              components={{
                br: <br key={0} />,
                link1: (
                  <Link
                    key={1}
                    href="/38:29"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
                link2: (
                  <Link
                    key={2}
                    href="/47:24"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
                link3: (
                  <Link
                    key={3}
                    href="/4:82"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
                link4: (
                  <Link
                    key={4}
                    href="https://quranreflect.com/faq"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
                link5: (
                  <Link
                    key={5}
                    href="/learning-plans/five-lenses-to-reflect-on-the-quran"
                    variant={LinkVariant.Blend}
                    className={styles.link}
                    isNewTab
                  />
                ),
              }}
              i18nKey="notes:new-note-reflc-intro.what-is-reflc.desc"
            />
          </div>
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              {t('new-note-reflc-intro.reflc-prompts.title')}
            </div>
            <div className={classNames(styles.subSectionHeader)}>
              {t('new-note-reflc-intro.reflc-prompts.personal.title')}
            </div>
            <ul className={styles.bulletList}>
              <Trans
                i18nKey="notes:new-note-reflc-intro.reflc-prompts.personal.desc"
                components={{ li: <li key={0} /> }}
              />
            </ul>
            <div className={classNames(styles.subSectionHeader)}>
              {t('new-note-reflc-intro.reflc-prompts.deeper.title')}
            </div>
            <ul className={styles.bulletList}>
              <Trans
                i18nKey="notes:new-note-reflc-intro.reflc-prompts.deeper.desc"
                components={{ li: <li key={0} /> }}
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

export default ReflectionIntro;
