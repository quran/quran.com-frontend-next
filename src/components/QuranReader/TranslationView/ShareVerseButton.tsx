import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import CopyLinkIcon from '../../../../public/icons/copy-link.svg';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { logButtonClick } from 'src/utils/eventLogger';
import { getWindowOrigin } from 'src/utils/url';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

type ShareVerseButtonProps = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

export const onShareClicked = (
  verseKey: string,
  isTranslationView: boolean,
  callback: () => void,
) => {
  logButtonClick(
    // eslint-disable-next-line i18next/no-literal-string
    `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy`,
  );
  const origin = getWindowOrigin();
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  if (origin) {
    clipboardCopy(`${origin}/${chapter}/${verse}`).then(callback);
  }
};

const ShareVerseButton = ({
  verseKey,
  isTranslationView = true,
  onActionTriggered,
}: ShareVerseButtonProps) => {
  const { t } = useTranslation('common');
  const toast = useToast();

  const onButtonClicked = () => {
    onShareClicked(verseKey, isTranslationView, () =>
      toast(t('shared'), { status: ToastStatus.Success }),
    );
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  return (
    <Button
      onClick={onButtonClicked}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      tooltip={t('share')}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction)}
    >
      <span className={styles.icon}>
        <CopyLinkIcon />
      </span>
    </Button>
  );
};

export default ShareVerseButton;
