/* eslint-disable react/no-multi-comp */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';

import styles from './OverflowVerseActionsMenuBody.module.scss';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
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
}

const OverflowVerseActionsMenu: React.FC<Props> = ({ verse }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <PopoverMenu
        trigger={
          <Button size={ButtonSize.Small} tooltip={t('more')} type={ButtonType.Secondary}>
            <OverflowMenuIcon />
          </Button>
        }
        isModal={false}
        isPortalled={false}
        onOpenChange={(open: boolean) => {
          logEvent(`verse_actions_menu_${open ? 'open' : 'close'}`);
        }}
      >
        <OverflowVerseActionsMenuBody verse={verse} />
      </PopoverMenu>
    </div>
  );
};

export default OverflowVerseActionsMenu;
