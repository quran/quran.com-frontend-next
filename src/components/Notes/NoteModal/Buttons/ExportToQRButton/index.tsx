import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import ChatIcon from '@/icons/chat.svg';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {};

const ExportToQRButton: React.FC<Props> = () => {
  const { t } = useTranslation('common');

  const onExportClicked = () => {
    logButtonClick('export_note_to_qr');
    // TODO: here
  };

  return (
    <Button
      variant={ButtonVariant.Ghost}
      tooltip={t('notes:share-as-reflection')}
      htmlType="button"
      onClick={onExportClicked}
    >
      <ChatIcon />
    </Button>
  );
};

export default ExportToQRButton;
