import useTranslation from 'next-translate/useTranslation';

import QuranReflectIcon from '../../../../public/icons/QR.svg';

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
      tooltip={t('q-reflect')}
      type={ButtonType.Secondary}
      shouldFlipOnRTL={false}
    >
      <QuranReflectIcon />
    </Button>
  );
};

export default QuranReflectButton;
