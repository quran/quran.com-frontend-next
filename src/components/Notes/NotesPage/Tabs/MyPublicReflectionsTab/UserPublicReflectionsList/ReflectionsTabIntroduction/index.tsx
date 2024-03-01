import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionsTabIntroduction.module.scss';

import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';

const ReflectionsTabIntroduction = () => {
  const { t } = useTranslation('notes');
  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => {
    logEvent(`public_reflections_intro${newOpen ? 'open' : 'close'}`);
    setIsOpen(newOpen);
  };

  return (
    <div className={styles.container}>
      <Collapsible
        direction={CollapsibleDirection.Right}
        onOpenChange={onOpenChange}
        shouldOpen={isOpen}
        title={<div className={styles.title}>{t('reflections-intro.title')}</div>}
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
      >
        {({ isOpen: isCollapsibleOpen }) => {
          if (!isCollapsibleOpen) return null;
          return (
            <ul>
              <li>{t('reflections-intro.line-1')}</li>
              <li>{t('reflections-intro.line-2')}</li>
              <li>{t('reflections-intro.line-3')}</li>
              <li>{t('reflections-intro.line-4')}</li>
            </ul>
          );
        }}
      </Collapsible>
    </div>
  );
};

export default ReflectionsTabIntroduction;
