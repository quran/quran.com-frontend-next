/* eslint-disable react/no-multi-comp */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';
import cellStyles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import styles from './OverflowVerseActionsMenuBody.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import { logEvent } from 'src/utils/eventLogger';
import Verse from 'types/Verse';

const OverflowVerseActionsMenuBody = dynamic(() => import('./OverflowVerseActionsMenuBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

interface Props {
  verse: Verse;
  isModal?: boolean;
  isPortalled?: boolean;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
}

const OverflowVerseActionsMenu: React.FC<Props> = ({
  verse,
  isModal = false,
  isPortalled = false,
  isTranslationView = true,
  onActionTriggered,
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
            className={classNames(cellStyles.iconContainer, cellStyles.verseAction)}
          >
            <span className={cellStyles.icon}>
              <OverflowMenuIcon />
            </span>
          </Button>
        }
        isModal={isModal}
        isPortalled={isPortalled}
        onOpenChange={(open: boolean) => {
          logEvent(
            `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_${
              open ? 'open' : 'close'
            }`,
          );
        }}
      >
        <OverflowVerseActionsMenuBody
          verse={verse}
          isPortalled={isPortalled}
          isTranslationView={isTranslationView}
          onActionTriggered={onActionTriggered}
        />
      </PopoverMenu>
    </div>
  );
};

export default OverflowVerseActionsMenu;
