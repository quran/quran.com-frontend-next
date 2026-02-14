import React from 'react';

import styles from './CollectionDetailView.module.scss';
import { TranslateFn } from './types';

import CollectionHeaderActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover';
import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import ChevronLeft from '@/icons/chevron-left.svg';
import MenuMoreHorizIcon from '@/icons/menu_more_horiz.svg';
import { toLocalizedNumber } from '@/utils/locale';

interface CollectionDetailViewHeaderProps {
  collectionName: string;
  totalCount: number | null;
  lang: string;
  t: TranslateFn;
  onBack: () => void;
  isDefault?: boolean;
  isFetchingAll?: boolean;
  onCopyClick: () => void;
  onNoteClick: () => void;
  onPinVersesClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const CollectionDetailViewHeader: React.FC<CollectionDetailViewHeaderProps> = ({
  collectionName,
  totalCount,
  lang,
  t,
  onBack,
  isDefault,
  isFetchingAll,
  onCopyClick,
  onNoteClick,
  onPinVersesClick,
  onEditClick,
  onDeleteClick,
}) => {
  let countLabel: React.ReactNode;
  if (totalCount === null) {
    countLabel = t('common:loading');
  } else if (totalCount === 1) {
    countLabel = t('collections.items', { count: toLocalizedNumber(totalCount, lang) });
  } else {
    countLabel = t('collections.items_plural', { count: toLocalizedNumber(totalCount, lang) });
  }

  return (
    <div className={styles.header}>
      <Button onClick={onBack} variant={ButtonVariant.Ghost} className={styles.backButton}>
        <ChevronLeft />
        <span>{collectionName}</span>
      </Button>
      <div className={styles.badgeContainer}>
        <span className={styles.badge}>{countLabel}</span>
        <CollectionHeaderActionsPopover
          onCopyClick={onCopyClick}
          onNoteClick={onNoteClick}
          onPinVersesClick={onPinVersesClick}
          onEditClick={isDefault ? undefined : onEditClick}
          onDeleteClick={isDefault ? undefined : onDeleteClick}
          isDisabledAllActions={isFetchingAll}
          dataTestPrefix="collection-header-actions"
        >
          <button type="button" className={styles.iconButton} aria-label={t('common:more')}>
            <MenuMoreHorizIcon />
          </button>
        </CollectionHeaderActionsPopover>
      </div>
    </div>
  );
};

export default CollectionDetailViewHeader;
