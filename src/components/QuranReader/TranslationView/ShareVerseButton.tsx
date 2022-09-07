import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import CopyLinkIcon from '@/icons/copy-link.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getWindowOrigin } from '@/utils/url';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type ShareVerseButtonProps = {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;
};

export const onShareClicked = (
  verseKey: string,
  isTranslationView: boolean,
  callback: () => void,
  locale: string,
) => {
  logButtonClick(
    // eslint-disable-next-line i18next/no-literal-string
    `${isTranslationView ? 'translation_view' : 'reading_view'}_verse_actions_menu_copy`,
  );
  const origin = getWindowOrigin(locale);
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
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  const onButtonClicked = () => {
    onShareClicked(
      verseKey,
      isTranslationView,
      () => toast(t('shared'), { status: ToastStatus.Success }),
      lang,
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
      className={classNames(styles.iconContainer, styles.verseAction, {
        [styles.fadedVerseAction]: isTranslationView,
      })}
      ariaLabel={t('aria.share-ayah')}
    >
      <span className={styles.icon}>
        <CopyLinkIcon />
      </span>
    </Button>
  );
};

export default ShareVerseButton;
