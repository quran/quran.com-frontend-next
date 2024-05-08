import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import { selectTranslationAlignment, selectVerseAlignment } from '@/redux/slices/mediaMaker';
import { Alignment, Orientation } from '@/utils/media/constants';

type Props = {
  onSettingsUpdate: (settings: Record<string, any>) => void;
};

const AlignmentsSettings: React.FC<Props> = ({ onSettingsUpdate }) => {
  const { t } = useTranslation('quran-media-maker');
  const translationAlignment = useSelector(selectTranslationAlignment);
  const verseAlignment = useSelector(selectVerseAlignment);

  const onTranslationAlignmentChange = (val: Orientation) => {
    onSettingsUpdate({ translationAlignment: val });
  };

  const onVerseAlignmentChange = (val: Orientation) => {
    onSettingsUpdate({ verseAlignment: val });
  };

  return (
    <Section>
      <Section.Title>{t('text-alignment')}</Section.Title>
      <Section.Title>{t('common:verse')}</Section.Title>
      <Section.Row>
        <Switch
          items={[
            { name: t(Alignment.CENTRE), value: Alignment.CENTRE },
            { name: t(Alignment.JUSTIFIED), value: Alignment.JUSTIFIED },
          ]}
          selected={verseAlignment}
          onSelect={onVerseAlignmentChange}
        />
      </Section.Row>
      <br />
      <Section.Title>{t('common:translation')}</Section.Title>
      <Section.Row>
        <Switch
          items={[
            { name: t(Alignment.CENTRE), value: Alignment.CENTRE },
            { name: t(Alignment.JUSTIFIED), value: Alignment.JUSTIFIED },
          ]}
          selected={translationAlignment}
          onSelect={onTranslationAlignmentChange}
        />
      </Section.Row>
    </Section>
  );
};

export default AlignmentsSettings;
