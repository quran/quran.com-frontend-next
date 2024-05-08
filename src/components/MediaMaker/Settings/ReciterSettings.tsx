import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Select from '@/dls/Forms/Select';
import Reciter from '@/types/Reciter';

type Props = {
  reciters: Reciter[];
  onSettingsUpdate: (settings: Record<string, any>) => void;
  reciter: number;
};

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
    onSettingsUpdate({ reciter: newReciter });
  };

  return (
    <Section>
      <Section.Title>{t('common:reciter')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('common:audio.select-reciter')}</Section.Label>
        <Select
          id="quranFontStyles"
          name="quranFontStyles"
          options={recitersOptions || []}
          value={String(reciter)}
          onChange={onReciterChange}
        />
      </Section.Row>
    </Section>
  );
};

export default ReciterSettings;
