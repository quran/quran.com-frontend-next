import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import Alignment from '@/types/Media/Alignment';

type Props = {
  onSettingsUpdate: (settings: Record<string, any>) => void;
  translationAlignment: Alignment;
  verseAlignment: Alignment;
};

const AlignmentsSettings: React.FC<Props> = ({
  onSettingsUpdate,
  translationAlignment,
  verseAlignment,
}) => {
  const { t } = useTranslation('quran-media-maker');

  const onTranslationAlignmentChange = (val: Alignment) => {
    onSettingsUpdate({ translationAlignment: val });
  };

  const onVerseAlignmentChange = (val: Alignment) => {
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
