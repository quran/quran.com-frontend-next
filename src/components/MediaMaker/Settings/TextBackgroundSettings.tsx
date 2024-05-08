import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import BackgroundColors from './BackgroundColors';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';

type Props = {
  onSettingsUpdate: (settings: Record<string, any>) => void;
  opacity: string;
  shouldHaveBorder: string;
};

const TextBackgroundSettings: React.FC<Props> = ({
  onSettingsUpdate,
  opacity,
  shouldHaveBorder,
}) => {
  const { t } = useTranslation('quran-media-maker');

  return (
    <Section>
      <Section.Title>{t('background')}</Section.Title>
      <Section.Row>
        <BackgroundColors />
      </Section.Row>
      <br />
      <>
        <Section.Label>{t('opacity')}</Section.Label>
        <Section.Row>
          <Switch
            items={[
              { name: '0%', value: '0' },
              { name: '20%', value: '0.2' },
              { name: '40%', value: '0.4' },
              { name: '60%', value: '0.6' },
              { name: '80%', value: '0.8' },
              { name: '100%', value: '1' },
            ]}
            selected={opacity}
            onSelect={(newOpacity) => {
              if (newOpacity === opacity) {
                return;
              }
              onSettingsUpdate({ opacity: newOpacity });
            }}
          />
        </Section.Row>
        <br />
        <Section.Label>{t('border')}</Section.Label>
        <Section.Row>
          <Switch
            items={[
              { name: 'Yes', value: 'true' },
              { name: 'No', value: 'false' },
            ]}
            selected={shouldHaveBorder.toString()}
            onSelect={(val) => {
              onSettingsUpdate({ shouldHaveBorder: val });
            }}
          />
        </Section.Row>
      </>
    </Section>
  );
};
export default TextBackgroundSettings;
