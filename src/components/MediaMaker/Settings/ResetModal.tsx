import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteNoteButtonProps = {
  isDisabled?: boolean;
  onConfirm: () => void;
};

const ResetModal = ({ isDisabled, onConfirm }: DeleteNoteButtonProps) => {
  const { t } = useTranslation('media');
  const confirm = useConfirm();

  const onResetSettingsClick = async () => {
    logButtonClick('reset_media_maker');

    const isConfirmed = await confirm({
      confirmText: t('common:settings.reset'),
      cancelText: t('common:cancel'),
      title: t('reset-defaults'),
    });

    if (isConfirmed) {
      logButtonClick('reset_media_maker_confirm');
      onConfirm();
    } else {
      logButtonClick('reset_media_maker_cancel');
    }
  };

  const buttonProps = {
    isDisabled,
    isLoading: isDisabled,
  };

  return (
    <>
      <Button
        shape={ButtonShape.Pill}
        variant={ButtonVariant.Ghost}
        onClick={onResetSettingsClick}
        {...buttonProps}
      >
        {t('common:settings.reset')}
      </Button>
      <ConfirmationModal />
    </>
  );
};

export default ResetModal;
