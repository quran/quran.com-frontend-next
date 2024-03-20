import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './PublicReflectionCheckboxDescription.module.scss';

import Collapsible, { CollapsibleDirection } from '@/dls/Collapsible/Collapsible';
import Link, { LinkVariant } from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';

export enum NoteType {
  NEW = 'new',
  EDIT = 'edit',
}

type Props = {
  type?: NoteType;
};

const PublicReflectionDescription: React.FC<Props> = ({ type = NoteType.NEW }) => {
  const { t } = useTranslation('notes');
  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent(`${type}_note_reflection_intro_opened`);
    } else {
      logEvent(`${type}_note_reflection_intro_closed`);
    }
  };

  const isEdit = type === NoteType.EDIT;

  return (
    <div className={styles.container}>
      <Collapsible
        title={
          <div className={styles.title}>
            {isEdit ? t('checkbox-refl-intro.post-button') : t('checkbox-refl-intro.title')}
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
            <div className={styles.contentContainer}>
              <Trans
                components={{
                  li: <li key={0} />,
                  link: (
                    <Link
                      key={0}
                      href="https://quranreflect.com/faq"
                      variant={LinkVariant.Blend}
                      isNewTab
                    />
                  ),
                }}
                i18nKey="notes:checkbox-refl-intro.qr-intro"
              />
              <p className={styles.checkboxTitle}>
                {!isEdit
                  ? t('checkbox-refl-intro.checkbox.title')
                  : t('checkbox-refl-intro.post-button')}
              </p>

              <Trans
                components={{
                  li: <li key={0} />,
                  link: (
                    <Link
                      key={0}
                      href="https://quranreflect.com"
                      variant={LinkVariant.Blend}
                      isNewTab
                    />
                  ),
                }}
                i18nKey="notes:checkbox-refl-intro.checkbox.desc"
              />
            </div>
          );
        }}
      </Collapsible>
    </div>
  );
};

export default PublicReflectionDescription;
