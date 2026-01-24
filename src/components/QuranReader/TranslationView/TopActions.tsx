import React, { useCallback, useState } from 'react';

import ShareQuranModal from '../ReadingView/ShareQuranModal';

import ActionButtons from './ActionButtons';
import styles from './TranslationViewCell.module.scss';

import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type TopActionsProps = {
  verse: Verse;
  bookmarksRangeUrl: string;
  isTranslationView?: boolean;
  shouldUseModalZIndex?: boolean;
};

/**
 * Top actions component for the TranslationView and ReadingView Mobile
 * Contains verse navigation, bookmarking, translations, copy, notes, play audio, and overflow menu
 * @returns {JSX.Element} JSX element containing the top action buttons
 */
const TopActions: React.FC<TopActionsProps> = ({
  verse,
  bookmarksRangeUrl,
  isTranslationView = true,
  shouldUseModalZIndex = false,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const onOpenModalChange = useCallback(
    (isOpen: boolean) => {
      logEvent(
        `${isTranslationView ? 'translation' : 'reading'}_view_verse_actions_share_modal_${
          isOpen ? 'open' : 'close'
        }`,
      );
      setIsShareModalOpen(isOpen);
    },
    [isTranslationView],
  );

  return (
    <>
      <div className={styles.actionContainer}>
        <ActionButtons
          verse={verse}
          bookmarksRangeUrl={bookmarksRangeUrl}
          isTranslationView={isTranslationView}
          openShareModal={() => onOpenModalChange(true)}
          hasTranslationsButton={!isTranslationView}
          shouldUseModalZIndex={shouldUseModalZIndex}
        />
      </div>

      <ShareQuranModal
        isOpen={isShareModalOpen}
        onClose={() => onOpenModalChange(false)}
        verse={verse}
      />
    </>
  );
};

export default TopActions;
