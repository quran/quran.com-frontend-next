import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonVariant, ButtonSize, ButtonShape } from '@/dls/Button/Button';
import CheckIcon from '@/icons/check.svg';

interface MarkAsReadButtonProps {
  verseKey: string;
}

const MarkAsReadButton = ({ verseKey }: MarkAsReadButtonProps) => {
  const [isRead, setIsRead] = useState(false);
  const { t } = useTranslation('quran-reader');

  const onButtonClicked = () => {
    setIsRead(true);
  };

  return (
    <Button
      variant={ButtonVariant.Ghost}
      onClick={onButtonClicked}
      size={ButtonSize.Small}
      tooltip={t('mark-as-read')}
      shouldFlipOnRTL={false}
      shape={ButtonShape.Circle}
      className={classNames(styles.iconContainer, styles.verseAction, {
        [styles.fadedVerseAction]: true,
        [styles.successVerseAction]: isRead,
      })}
      ariaLabel={t('aria.mark-as-read')}
    >
      <span className={styles.icon}>
        <CheckIcon />
      </span>
    </Button>
  );
};

export default MarkAsReadButton;
