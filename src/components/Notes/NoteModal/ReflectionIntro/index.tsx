import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionIntro.module.scss';

import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import IdeaIcon from '@/icons/idea.svg';
import { logEvent } from '@/utils/eventLogger';

const ReflectionIntro = () => {
  const { t } = useTranslation('notes');
  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('new_note_reflection_intro_opened');
    } else {
      logEvent('new_note_reflection_intro_closed');
    }
  };

  return (
    <div className={styles.container}>
      <Collapsible
        title={
          <div className={styles.title}>
            <IdeaIcon />
            {t('new-note-reflc-intro.title')}
          </div>
        }
        prefix={<ChevronDownIcon />}
        direction={CollapsibleDirection.Right}
        shouldRotatePrefixOnToggle
        onOpenChange={onOpenChange}
      >
        {({ isOpen: isOpenRenderProp }) => {
          if (!isOpenRenderProp) return null;

          return (
            <div>
              <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                  {t('new-note-reflc-intro.what-is-reflc.title')}
                </div>
                <Trans
                  components={{
                    br: <br key={0} />,
                    link1: <Link key={1} href="/38:29" variant={LinkVariant.Blend} isNewTab />,
                    link2: <Link key={2} href="/47:24" variant={LinkVariant.Blend} isNewTab />,
                    link3: <Link key={3} href="/4:82" variant={LinkVariant.Blend} isNewTab />,
                    link4: (
                      <Link
                        key={4}
                        href="https://quranReflect.com/faq"
                        variant={LinkVariant.Blend}
                        isNewTab
                      />
                    ),
                    link5: (
                      <Link
                        key={5}
                        href="/learning-plans/five-lenses-to-reflect-on-the-quran"
                        variant={LinkVariant.Blend}
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
                <div className={styles.sectionHeader}>
                  {t('new-note-reflc-intro.reflc-prompts.personal.title')}
                </div>
                <Trans
                  components={{
                    br: <br key={0} />,
                    li: <li key={1} />,
                  }}
                  i18nKey="notes:new-note-reflc-intro.reflc-prompts.personal.desc"
                />
                <div className={classNames(styles.sectionHeader, styles.subSectionHeader)}>
                  {t('new-note-reflc-intro.reflc-prompts.deeper.title')}
                </div>
                <Trans
                  components={{
                    br: <br key={0} />,
                    li: <li key={1} />,
                  }}
                  i18nKey="notes:new-note-reflc-intro.reflc-prompts.deeper.desc"
                />
              </div>
            </div>
          );
        }}
      </Collapsible>
    </div>
  );
};

export default ReflectionIntro;
