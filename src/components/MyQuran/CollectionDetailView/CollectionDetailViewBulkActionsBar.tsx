import React from 'react';

import styles from './CollectionDetailView.module.scss';
import { TranslateFn } from './types';

import CollectionBulkActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover';
import Button, { ButtonSize, ButtonVariant } from '@/components/dls/Button/Button';
import { toLocalizedNumber } from '@/utils/locale';

interface CollectionDetailViewBulkActionsBarProps {
  isAllExpanded: boolean;
  isSelectMode: boolean;
  isOwner: boolean;
  lang: string;
  selectedCount: number;
  t: TranslateFn;
  onToggleExpandCollapseAll: () => void;
  onToggleSelectMode: () => void;
  onBulkNoteClick: () => void;
  onPinSelectedVerses: () => void;
  onBulkCopyClick: () => void;
  onBulkDeleteClick: () => void;
}

const CollectionDetailViewBulkActionsBar: React.FC<CollectionDetailViewBulkActionsBarProps> = ({
  isAllExpanded,
  isSelectMode,
  isOwner,
  lang,
  selectedCount,
  t,
  onToggleExpandCollapseAll,
  onToggleSelectMode,
  onBulkNoteClick,
  onPinSelectedVerses,
  onBulkCopyClick,
  onBulkDeleteClick,
}) => {
  return (
    <div className={styles.bulkActionsContainer}>
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.XSmall}
        className={styles.bulkActionButton}
        onClick={onToggleExpandCollapseAll}
      >
        {isAllExpanded ? t('bulk-actions.collapse-all') : t('bulk-actions.expand-all')}
      </Button>

      {isSelectMode ? (
        <div className={styles.selectModeActions}>
          <Button
            variant={ButtonVariant.Ghost}
            size={ButtonSize.XSmall}
            className={styles.bulkActionButton}
            onClick={onToggleSelectMode}
          >
            {t('bulk-actions.cancel')}
          </Button>
          {selectedCount > 0 ? (
            <CollectionBulkActionsPopover
              onNoteClick={onBulkNoteClick}
              onPinVersesClick={onPinSelectedVerses}
              onCopyClick={onBulkCopyClick}
              onDeleteClick={isOwner ? onBulkDeleteClick : undefined}
              dataTestPrefix="collection-bulk-actions"
            >
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.XSmall}
                className={styles.bulkActionButton}
              >
                {t('bulk-actions.actions-count', {
                  count: toLocalizedNumber(selectedCount, lang),
                })}
              </Button>
            </CollectionBulkActionsPopover>
          ) : (
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.XSmall}
              className={styles.bulkActionButton}
              isDisabled
            >
              {t('bulk-actions.actions')}
            </Button>
          )}
        </div>
      ) : (
        <Button
          variant={ButtonVariant.Ghost}
          className={styles.bulkActionButton}
          size={ButtonSize.XSmall}
          onClick={onToggleSelectMode}
        >
          {t('bulk-actions.select')}
        </Button>
      )}
    </div>
  );
};

export default CollectionDetailViewBulkActionsBar;
