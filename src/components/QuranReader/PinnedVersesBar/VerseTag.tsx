import React from 'react';

import classNames from 'classnames';

import styles from './VerseTag.module.scss';

import CloseIcon from '@/icons/close.svg';

interface VerseTagProps {
  verseKey: string;
  onRemove: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

const VerseTag: React.FC<VerseTagProps> = ({ verseKey, onRemove, onClick, isSelected = false }) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      }
    }
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onRemove();
    }
  };

  return (
    <div
      className={classNames(styles.tag, {
        [styles.selected]: isSelected,
        [styles.clickable]: !!onClick,
      })}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span
        className={classNames(styles.verseKey, {
          [styles.verseKeySelected]: isSelected,
        })}
      >
        {verseKey}
      </span>
      <button
        type="button"
        className={classNames(styles.removeButton, {
          [styles.removeButtonSelected]: isSelected,
        })}
        onClick={handleRemoveClick}
        onKeyDown={handleRemoveKeyDown}
        aria-label={`Remove verse ${verseKey} from pinned`}
      >
        <CloseIcon
          className={classNames(styles.closeIcon, {
            [styles.closeIconSelected]: isSelected,
          })}
        />
      </button>
    </div>
  );
};

export default VerseTag;
