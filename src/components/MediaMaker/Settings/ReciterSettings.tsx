import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Select, { SelectSize } from '@/dls/Forms/Select';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import Reciter from '@/types/Reciter';

interface Props extends MediaSettingsProps {
  reciters: Reciter[];
  reciter: number;
}

const ReciterSettings: React.FC<Props> = ({ reciters, onSettingsUpdate, reciter }) => {
  const { t } = useTranslation('media');

  const recitersOptions = useMemo(() => {
    const DEFAULT_RECITATION_STYLE = 'Murattal';

    return reciters.map((reciterObj) => {
      let label = reciterObj.translatedName.name;
      const recitationStyle = reciterObj.style.name;
      if (recitationStyle !== DEFAULT_RECITATION_STYLE) {
        label = `${label} - ${recitationStyle}`;
      }
      return {
        id: reciterObj.id,
        label,
        value: reciterObj.id,
        name: reciterObj.name,
      };
    });
  }, [reciters]);

  const onReciterChange = (newReciter) => {
    onSettingsUpdate({ reciter: newReciter }, 'reciter', newReciter);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('common:reciter')}</div>
      <div className={styles.selectContainer}>
        <Select
          id="reciter"
          name="reciter"
          options={recitersOptions || []}
          value={String(reciter)}
          onChange={onReciterChange}
          size={SelectSize.Medium}
          className={styles.select}
        />
      </div>
    </div>
  );
};

export default ReciterSettings;
