import React, { Dispatch, SetStateAction, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeLayersTab.module.scss';
import { LayerMode } from './types';

import FontSizeControl from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import IconContainer from '@/dls/IconContainer/IconContainer';
import ExpandArrowIcon from '@/icons/expand-arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface LayerControlsProps {
  layerMode: LayerMode;
  setLayerMode: Dispatch<SetStateAction<LayerMode>>;
  isExpandable: boolean;
  verseKey: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  layerMode,
  setLayerMode,
  isExpandable,
  verseKey,
}) => {
  const { t } = useTranslation('quran-reader');

  const handleToggleLayerMode = useCallback(() => {
    setLayerMode((prev) => {
      const isExpanding = prev !== LayerMode.Expanded;
      logButtonClick(isExpanding ? 'study_mode_layers_expand' : 'study_mode_layers_collapse', {
        verseKey,
      });
      return isExpanding ? LayerMode.Expanded : LayerMode.Collapsed;
    });
  }, [setLayerMode, verseKey]);

  return (
    <div className={styles.controls}>
      <FontSizeControl fontType="layers" />
      <button
        type="button"
        className={styles.layerButton}
        disabled={!isExpandable}
        onClick={handleToggleLayerMode}
      >
        <IconContainer
          icon={<ExpandArrowIcon />}
          shouldForceSetColors={false}
          className={styles.layerButtonIcon}
        />
        {layerMode === LayerMode.Expanded ? t('layers.contract') : t('layers.expand')}
      </button>
    </div>
  );
};

export default LayerControls;
