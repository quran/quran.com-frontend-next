import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { deleteCollection } from 'src/utils/auth/api';

const DeleteCollectionAction = ({ collectionId, onDone }) => {
  const { t } = useTranslation();

  const onMenuClicked = () => {
    deleteCollection(collectionId).then(() => {
      onDone();
    });
  };

  return <PopoverMenu.Item onClick={onMenuClicked}>{t('profile:delete')}</PopoverMenu.Item>;
};

export default DeleteCollectionAction;
