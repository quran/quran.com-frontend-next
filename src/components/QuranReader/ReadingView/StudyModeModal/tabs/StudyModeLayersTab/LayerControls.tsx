import React, { Dispatch, SetStateAction } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeLayersTab.module.scss';
import { LayerMode } from './types';

import FontSizeControl from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import IconContainer from '@/dls/IconContainer/IconContainer';
import ExpandArrowIcon from '@/icons/expand-arrow.svg';

interface LayerControlsProps {
  layerMode: LayerMode;
  setLayerMode: Dispatch<SetStateAction<LayerMode>>;
  isExpandable: boolean;
}

const LayerControls: React.FC<LayerControlsProps> = ({ layerMode, setLayerMode, isExpandable }) => {
  const { t } = useTranslation('quran-reader');

  return (
    <div className={styles.controls}>
      <FontSizeControl fontType="layers" />
      <button
        type="button"
        className={styles.layerButton}
        disabled={!isExpandable}
        onClick={() =>
          setLayerMode((prev) =>
            prev === LayerMode.Expanded ? LayerMode.Collapsed : LayerMode.Expanded,
          )
        }
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
