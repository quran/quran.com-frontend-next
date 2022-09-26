import useTranslation from 'next-translate/useTranslation';

import { logButtonClick } from '@/utils/eventLogger';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

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
