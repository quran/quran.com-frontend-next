import useTranslation from 'next-translate/useTranslation';

import QuranReflectIcon from '../../../../public/icons/QR.svg';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

type QuranReflectButtonProps = {
  verseKey: string;
};

const QuranReflectButton = ({ verseKey }: QuranReflectButtonProps) => {
  const { t } = useTranslation('common');
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  return (
    <Button
      href={`https://quranreflect.com/${chapter}/${verse}?feed=true`}
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
