import React from 'react';

import SaveBookmarkModal, {
  SaveBookmarkType,
} from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import Verse from '@/types/Verse';

interface BookmarkModalProps {
  verse: Verse;
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack?: () => void;
}

const BookmarkModal: React.FC<BookmarkModalProps> = ({
  verse,
  wasOpenedFromStudyMode,
  onClose,
  onBack,
}) => (
  <SaveBookmarkModal
    isOpen
    type={SaveBookmarkType.AYAH}
    verse={verse}
    onClose={onClose}
    onBack={wasOpenedFromStudyMode ? onBack : undefined}
    wasOpenedFromStudyMode={wasOpenedFromStudyMode}
  />
);

export default BookmarkModal;
