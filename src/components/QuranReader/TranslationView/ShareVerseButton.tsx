import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import CopyLinkIcon from '../../../../public/icons/copy-link.svg';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import { logButtonClick } from 'src/utils/eventLogger';
import { getWindowOrigin } from 'src/utils/url';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

type ShareVerseButtonProps = {
  verseKey: string;
};

export const onShareClicked = (verseKey, callback: () => void) => {
  logButtonClick('verse_actions_menu_copy');
  const origin = getWindowOrigin();
  const [chapter, verse] = getVerseAndChapterNumbersFromKey(verseKey);
  if (origin) {
    clipboardCopy(`${origin}/${chapter}/${verse}`).then(callback);
  }
};

const ShareVerseButton = ({ verseKey }: ShareVerseButtonProps) => {
  const { t } = useTranslation('common');
  const toast = useToast();

  return (
    <>
      <Button
        onClick={() =>
          onShareClicked(verseKey, () => toast(t('shared'), { status: ToastStatus.Success }))
        }
        size={ButtonSize.Small}
        tooltip={t('share')}
        shouldFlipOnRTL={false}
        type={ButtonType.Secondary}
      >
        <span className={styles.icon}>
          <CopyLinkIcon />
        </span>
      </Button>
    </>
  );
};

export default ShareVerseButton;
