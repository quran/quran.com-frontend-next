import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import {
  selectTranslationAlignment,
  selectVerseAlignment,
  updateSettings,
} from '@/redux/slices/videoGenerator';
import { Alignment, Orientation } from '@/utils/videoGenerator/constants';

const AlignmentsSettings = () => {
  const { t } = useTranslation('video-generator');
  const translationAlignment = useSelector(selectTranslationAlignment);
  const verseAlignment = useSelector(selectVerseAlignment);
  const dispatch = useDispatch();

  const onTranslationAlignmentChange = (val: Orientation) => {
    dispatch(updateSettings({ translationAlignment: val }));
  };

  const onVerseAlignmentChange = (val: Orientation) => {
    dispatch(updateSettings({ verseAlignment: val }));
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
