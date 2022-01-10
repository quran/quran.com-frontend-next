import useTranslation from 'next-translate/useTranslation';

import ChatIcon from '../../../../public/icons/chat-filled.svg';

import styles from './TranslationViewCell.module.scss';

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
        logButtonClick('translation_view_reflect');
        navigateToExternalUrl(getQuranReflectVerseUrl(verseKey));
      }}
      size={ButtonSize.Small}
      tooltip={t('reflect')}
      shouldFlipOnRTL={false}
      type={ButtonType.Secondary}
    >
      <span className={styles.icon}>
        <ChatIcon />
      </span>
    </Button>
  );
};

export default QuranReflectButton;
