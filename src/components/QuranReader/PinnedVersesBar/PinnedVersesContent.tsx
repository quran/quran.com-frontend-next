import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './PinnedVersesBar.module.scss';
import PinnedVersesMenu from './PinnedVersesMenu';
import VerseTag from './VerseTag';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CompareIcon from '@/icons/compare.svg';
import { PinnedVerse } from '@/redux/slices/QuranReader/pinnedVerses';

interface PinnedVersesContentProps {
  pinnedVerses: PinnedVerse[];
  selectedVerseKey?: string | null;
  showCompareButton?: boolean;
  noPadding?: boolean;
  onVerseTagClick: (verseKey: string) => void;
  onRemoveVerse: (verseKey: string) => void;
  onCompareClick?: () => void;
  onClear: () => void;
  onSaveToCollection: () => void;
  onLoadFromCollection: () => void;
  onCopy: () => void;
  onAddNote?: () => void;
}

const PinnedVersesContent: React.FC<PinnedVersesContentProps> = ({
  pinnedVerses,
  selectedVerseKey,
  showCompareButton = true,
  noPadding = false,
  onVerseTagClick,
  onRemoveVerse,
  onCompareClick,
  onClear,
  onSaveToCollection,
  onLoadFromCollection,
  onCopy,
  onAddNote,
}) => {
  const { t } = useTranslation('quran-reader');

  return (
    <div
      className={classNames(styles.barContent, {
        [styles.noPadding]: noPadding,
      })}
    >
      <div className={styles.labelAndTags}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{t('pinned-verses')}:</span>
          <div className={styles.actions}>
            {showCompareButton && onCompareClick && (
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
                onClick={onCompareClick}
                tooltip={t('compare-verses')}
                ariaLabel={t('compare-verses')}
                className={styles.compareButton}
              >
                <CompareIcon />
              </Button>
            )}
            <PinnedVersesMenu
              onClear={onClear}
              onSaveToCollection={onSaveToCollection}
              onLoadFromCollection={onLoadFromCollection}
              onCopy={onCopy}
              onAddNote={onAddNote}
            />
          </div>
        </div>
        <div className={styles.tagsContainer}>
          {pinnedVerses.map((verse) => (
            <VerseTag
              key={verse.verseKey}
              verseKey={verse.verseKey}
              onRemove={() => onRemoveVerse(verse.verseKey)}
              onClick={() => onVerseTagClick(verse.verseKey)}
              isSelected={selectedVerseKey === verse.verseKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedVersesContent;
