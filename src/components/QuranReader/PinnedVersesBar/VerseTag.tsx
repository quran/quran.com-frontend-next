import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './VerseTag.module.scss';

import CloseIcon from '@/icons/close.svg';
import { toLocalizedVerseKey } from '@/utils/locale';

interface VerseTagProps {
  verseKey: string;
  onRemove: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

const VerseTag: React.FC<VerseTagProps> = ({ verseKey, onRemove, onClick, isSelected = false }) => {
  const { t, lang } = useTranslation('quran-reader');
  const localizedVerseKey = toLocalizedVerseKey(verseKey, lang);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onRemove();
    }
  };

  const tagClassName = classNames(styles.tag, {
    [styles.selected]: isSelected,
    [styles.clickable]: !!onClick,
  });

  const verseKeySpan = (
    <span
      className={classNames(styles.verseKey, {
        [styles.verseKeySelected]: isSelected,
      })}
    >
      {localizedVerseKey}
    </span>
  );

  const removeButton = (
    <button
      type="button"
      className={classNames(styles.removeButton, {
        [styles.removeButtonSelected]: isSelected,
      })}
      onClick={handleRemoveClick}
      onKeyDown={handleRemoveKeyDown}
      aria-label={t('remove-pinned-verse', { verseKey: localizedVerseKey })}
    >
      <CloseIcon
        className={classNames(styles.closeIcon, {
          [styles.closeIconSelected]: isSelected,
        })}
      />
    </button>
  );

  if (onClick) {
    return (
      <button type="button" className={tagClassName} onClick={onClick}>
        {verseKeySpan}
        {removeButton}
      </button>
    );
  }

  return (
    <span className={tagClassName}>
      {verseKeySpan}
      {removeButton}
    </span>
  );
};

export default VerseTag;
