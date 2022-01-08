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
};

const QuranReflectButton = ({ verseKey }: QuranReflectButtonProps) => {
  const { t } = useTranslation('common');
  return (
    <Button
      variant={ButtonVariant.Ghost}
      onClick={() => {
        logButtonClick('translation_view_reflect');
        navigateToExternalUrl(getQuranReflectVerseUrl(verseKey));
      }}
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
