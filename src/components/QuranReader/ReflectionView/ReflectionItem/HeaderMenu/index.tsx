import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { getQuranReflectPostUrl } from '@/utils/navigation';
import { navigateToExternalUrl } from '@/utils/url';

type Props = {
  postId: number;
};

const HeaderMenu: React.FC<Props> = ({ postId }) => {
  const { t } = useTranslation();
  return (
    <div>
      <PopoverMenu
        isPortalled={false}
        trigger={
          <Button
            size={ButtonSize.Small}
            tooltip={t('common:more')}
            variant={ButtonVariant.Ghost}
            shape={ButtonShape.Circle}
          >
            <OverflowMenuIcon />
          </Button>
        }
      >
        <PopoverMenu.Item
          onClick={() => {
            navigateToExternalUrl(getQuranReflectPostUrl(postId));
          }}
        >
          {t('quran-reader:view-on-quran-reflect')}
        </PopoverMenu.Item>
      </PopoverMenu>
    </div>
  );
};

export default HeaderMenu;
