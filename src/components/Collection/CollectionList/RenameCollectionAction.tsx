import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import { logButtonClick } from '@/utils/eventLogger';

const RenameCollectionAction = ({ onClick }) => {
  const { t } = useTranslation();

  const onMenuItemClicked = () => {
    logButtonClick('rename_collection_action_open');
    onClick();
  };

  return (
    <>
      <PopoverMenu.Item shouldStopPropagation shouldCloseMenuAfterClick onClick={onMenuItemClicked}>
        {t('common:rename')}
      </PopoverMenu.Item>
    </>
  );
};

export default RenameCollectionAction;
