import useTranslation from 'next-translate/useTranslation';

import ChatIcon from '../../../../public/icons/chat.svg';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { getQuranReflectVerseUrl } from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';

type QuranReflectButtonProps = {
  verseKey: string;
};

const QuranReflectButton = ({ verseKey }: QuranReflectButtonProps) => {
  const { t } = useTranslation('common');
  return (
    <Button
      onClick={() => {
        logButtonClick('verse_actions_menu_reflect');
        navigateToExternalUrl(getQuranReflectVerseUrl(verseKey));
      }}
      size={ButtonSize.Small}
      tooltip={t('reflect')}
      type={ButtonType.Secondary}
      shouldFlipOnRTL={false}
    >
      <ChatIcon />
    </Button>
  );
};

export default QuranReflectButton;
