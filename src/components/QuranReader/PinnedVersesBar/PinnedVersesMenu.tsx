import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import TrashIcon from '@/icons/close.svg';
import CollectionIcon from '@/icons/collection.svg';
import CopyIcon from '@/icons/copy.svg';
import DownloadIcon from '@/icons/download.svg';
import MoreIcon from '@/icons/more.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface PinnedVersesMenuProps {
  onClear: () => void;
  onSaveToCollection?: () => void;
  onLoadFromCollection?: () => void;
  onCopy?: () => void;
}

const PinnedVersesMenu: React.FC<PinnedVersesMenuProps> = ({
  onClear,
  onSaveToCollection,
  onLoadFromCollection,
  onCopy,
}) => {
  const { t } = useTranslation('quran-reader');

  const handleSaveToCollection = () => {
    logButtonClick('pinned_menu_save_to_collection');
    onSaveToCollection?.();
  };

  const handleLoadFromCollection = () => {
    logButtonClick('pinned_menu_load_from_collection');
    onLoadFromCollection?.();
  };

  const handleCopy = () => {
    logButtonClick('pinned_menu_copy');
    onCopy?.();
  };

  const handleClear = () => {
    logButtonClick('pinned_menu_clear_all');
    onClear();
  };

  return (
    <PopoverMenu
      trigger={
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          tooltip={t('common:more')}
          ariaLabel={t('common:more')}
        >
          <MoreIcon />
        </Button>
      }
    >
      <PopoverMenu.Item
        icon={<CollectionIcon />}
        onClick={handleSaveToCollection}
        shouldCloseMenuAfterClick
      >
        {t('save-pinned-to-collection')}
      </PopoverMenu.Item>

      <PopoverMenu.Item
        icon={<DownloadIcon />}
        onClick={handleLoadFromCollection}
        shouldCloseMenuAfterClick
      >
        {t('load-from-collection')}
      </PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item icon={<CopyIcon />} onClick={handleCopy} shouldCloseMenuAfterClick>
        {t('copy-pinned')}
      </PopoverMenu.Item>

      <PopoverMenu.Divider />

      <PopoverMenu.Item icon={<TrashIcon />} onClick={handleClear} shouldCloseMenuAfterClick>
        {t('clear-pinned')}
      </PopoverMenu.Item>
    </PopoverMenu>
  );
};

export default PinnedVersesMenu;
