import useTranslation from 'next-translate/useTranslation';

import ChatIcon from '../../../../public/icons/chat.svg';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { getQuranReflectVerseUrl } from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';

type QuranReflectButtonProps = {
  verseKey: string;
};

const QuranReflectButton = ({ verseKey }: QuranReflectButtonProps) => {
  const { t } = useTranslation('common');
  return (
    <Button
      onClick={() => navigateToExternalUrl(getQuranReflectVerseUrl(verseKey))}
      size={ButtonSize.Small}
      tooltip={t('reflect-this-verse')}
      type={ButtonType.Secondary}
      shouldFlipOnRTL={false}
    >
      <ChatIcon />
    </Button>
  );
};

export default QuranReflectButton;
