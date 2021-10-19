/* eslint-disable react/no-multi-comp */
import React from 'react';

import dynamic from 'next/dynamic';

import OverflowMenuIcon from '../../../public/icons/menu_more_horiz.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import Spinner from 'src/components/dls/Spinner/Spinner';
import Verse from 'types/Verse';

const OverflowVerseActionsMenuBody = dynamic(() => import('./OverflowVerseActionsMenuBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

interface Props {
  verse: Verse;
}

const OverflowVerseActionsMenu: React.FC<Props> = ({ verse }) => {
  return (
    <PopoverMenu
      trigger={
        <Button tooltip="More" type={ButtonType.Secondary}>
          <OverflowMenuIcon />
        </Button>
      }
    >
      <OverflowVerseActionsMenuBody verse={verse} />
    </PopoverMenu>
  );
};

export default OverflowVerseActionsMenu;
