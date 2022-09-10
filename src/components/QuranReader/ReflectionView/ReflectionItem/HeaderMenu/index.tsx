import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranReflectEditUrl, getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { navigateToExternalUrl } from '@/utils/url';

type Props = {
  postId: number;
  selectedChapterId: string;
  selectedVerseNumber: string;
};

const HeaderMenu: React.FC<Props> = ({ postId, selectedChapterId, selectedVerseNumber }) => {
  const { t } = useTranslation();

  const onMoreMenuClicked = () => {
    logButtonClick('reflection_item_more_menu');
  };

  const onViewOnQuranReflectClicked = () => {
    logButtonClick('view_on_quran_reflect');
    navigateToExternalUrl(getQuranReflectPostUrl(postId));
  };

  const onShareYourReflectionClicked = () => {
    logButtonClick('share_your_reflections');
    navigateToExternalUrl(getQuranReflectEditUrl(selectedChapterId, selectedVerseNumber));
  };

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
            onClick={onMoreMenuClicked}
          >
            <OverflowMenuIcon />
          </Button>
        }
      >
        <PopoverMenu.Item onClick={onViewOnQuranReflectClicked}>
          {t('quran-reader:view-on-quran-reflect')}
        </PopoverMenu.Item>
        <PopoverMenu.Item onClick={onShareYourReflectionClicked}>
          {t('quran-reader:share-your-reflection')}
        </PopoverMenu.Item>
      </PopoverMenu>
    </div>
  );
};

export default HeaderMenu;
