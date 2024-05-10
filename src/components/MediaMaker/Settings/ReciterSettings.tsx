import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Select, { SelectSize } from '@/dls/Forms/Select';
import { MediaSettingsProps } from '@/types/Media/MediaSettings';
import Reciter from '@/types/Reciter';

interface Props extends MediaSettingsProps {
  reciters: Reciter[];
  reciter: number;
}

const ReciterSettings: React.FC<Props> = ({ reciters, onSettingsUpdate, reciter }) => {
  const { t } = useTranslation('quran-media-maker');

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
    <Section>
      <Section.Title>{t('common:reciter')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('common:audio.select-reciter')}</Section.Label>
        <Select
          id="reciter"
          name="reciter"
          options={recitersOptions || []}
          value={String(reciter)}
          onChange={onReciterChange}
          size={SelectSize.Small}
          className={styles.select}
        />
      </Section.Row>
    </Section>
  );
};

export default ReciterSettings;
