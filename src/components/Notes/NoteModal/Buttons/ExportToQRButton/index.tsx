import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChatIcon from '@/icons/chat.svg';
import { postToQR } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  ranges: string[];
  body: string;
};

const ExportToQRButton: React.FC<Props> = ({ ranges, body }) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const onExportClicked = () => {
    logButtonClick('export_note_to_qr');
    setIsLoading(true);
    postToQR({
      isPrivate: true,
      body,
      ranges,
    })
      .then(() => {
        toast(t('notes:export-success'), {
          status: ToastStatus.Success,
        });
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Button
      variant={ButtonVariant.Ghost}
      tooltip={t('notes:share-as-reflection')}
      htmlType="button"
      onClick={onExportClicked}
      isLoading={isLoading}
      isDisabled={isLoading}
    >
      <ChatIcon />
    </Button>
  );
};

export default ExportToQRButton;
