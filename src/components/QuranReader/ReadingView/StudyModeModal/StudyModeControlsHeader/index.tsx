import React, { ReactNode } from 'react';

import FontSizeControl, { FontSizeType } from '../FontSizeControl';

import styles from './StudyModeControlsHeader.module.scss';

interface StudyModeControlsHeaderProps {
  languageSelector: ReactNode;
  fontType?: FontSizeType;
}

const StudyModeControlsHeader: React.FC<StudyModeControlsHeaderProps> = ({
  languageSelector,
  fontType = 'reflection',
}) => {
  return (
    <div className={styles.container}>
      <FontSizeControl className={styles.fontControl} fontType={fontType} />
      <div className={styles.languageSelector}>{languageSelector}</div>
    </div>
  );
};

export default StudyModeControlsHeader;
