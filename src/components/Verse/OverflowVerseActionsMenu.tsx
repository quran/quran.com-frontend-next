/* eslint-disable react/no-multi-comp */
import React from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import cellStyles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import styles from './OverflowVerseActionsMenuBody.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

const OverflowVerseActionsMenuBody = dynamic(() => import('./OverflowVerseActionsMenuBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

interface Props {
  verse: Verse;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
}

const OverflowVerseActionsMenu: React.FC<Props> = ({
  verse,
  isTranslationView = true,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <PopoverMenu
        trigger={
          <Button
            size={ButtonSize.Small}
            tooltip={t('more')}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
            className={classNames(
              cellStyles.iconContainer,
              cellStyles.verseAction,
              {
                [cellStyles.fadedVerseAction]: isTranslationView,
              },
              'overflow-verse-actions-menu-trigger', // for onboarding
            )}
            ariaLabel={t('more')}
          >
            <span className={cellStyles.icon}>
              <OverflowMenuIcon />
            </span>
          </Button>
        }
        isModal
        isPortalled
        renderMenuBody={(setOpen) => (
          <OverflowVerseActionsMenuBody
            verse={verse}
            isTranslationView={isTranslationView}
            onActionTriggered={onActionTriggered}
            bookmarksRangeUrl={bookmarksRangeUrl}
            setOpenOverflowVerseActionsMenu={setOpen}
          />
        )}
        onOpenChange={(open: boolean) => {
          logEvent(
            `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_${
              open ? 'open' : 'close'
            }`,
          );
        }}
      />
    </div>
  );
};

export default OverflowVerseActionsMenu;
