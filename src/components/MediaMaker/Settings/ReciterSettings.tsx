import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Select from '@/dls/Forms/Select';
import { selectReciter, updateSettings } from '@/redux/slices/mediaMaker';
import Reciter from '@/types/Reciter';

type Props = {
  reciters: Reciter[];
};

const ReciterSettings: React.FC<Props> = ({ reciters }) => {
  const { t } = useTranslation('quran-media-maker');
  const reciter = useSelector(selectReciter, shallowEqual);
  const dispatch = useDispatch();

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

  return (
    <Section>
      <Section.Title>{t('common:reciter')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('common:audio.select-reciter')}</Section.Label>
        <Select
          id="quranFontStyles"
          name="quranFontStyles"
          options={recitersOptions || []}
          value={reciter}
          onChange={(newReciter) => {
            dispatch(updateSettings({ reciter: newReciter }));
          }}
        />
      </Section.Row>
    </Section>
  );
};

export default ReciterSettings;
