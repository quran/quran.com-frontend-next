import React from 'react';

import ReaderBioModalComponent from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/StudyModeQiraatTab/ReadersPanel/ReaderBioModal';
import { QiraatReader } from '@/types/Qiraat';

interface ReaderBioModalProps {
  reader: QiraatReader | null;
  isOpen: boolean;
  onClose: () => void;
  wasOpenedFromStudyMode?: boolean;
  onBack?: () => void;
}

const ReaderBioModal: React.FC<ReaderBioModalProps> = ({
  reader,
  isOpen,
  onClose,
  wasOpenedFromStudyMode,
  onBack,
}) => {
  return (
    <ReaderBioModalComponent
      reader={reader}
      isOpen={isOpen}
      onClose={onClose}
      wasOpenedFromStudyMode={wasOpenedFromStudyMode}
      onBack={onBack}
    />
  );
};

export default ReaderBioModal;
