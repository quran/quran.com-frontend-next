import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import ChatIcon from '../../../../public/icons/chat.svg';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { getQuranReflectVerseUrl } from 'src/utils/navigation';
import { navigateToExternalUrl } from 'src/utils/url';

type QuranReflectButtonProps = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

const QuranReflectButton = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}: QuranReflectButtonProps) => {
  const { t } = useTranslation('common');

  const onButtonClicked = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_reflect`);
    navigateToExternalUrl(getQuranReflectVerseUrl(verseKey));
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  return (
    <Button
      variant={ButtonVariant.Ghost}
      onClick={onButtonClicked}
      size={ButtonSize.Small}
      tooltip={t('reflect')}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction)}
    >
      <span className={styles.icon}>
        <ChatIcon />
      </span>
    </Button>
  );
};

export default QuranReflectButton;
