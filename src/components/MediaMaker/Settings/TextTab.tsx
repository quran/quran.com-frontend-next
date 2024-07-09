import { FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Counter from '@/dls/Counter/Counter';
import {
  MAXIMUM_QURAN_FONT_STEP,
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  MINIMUM_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';
// TODO: QURAN FONT STYLE

type TextTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const TextTab: FC<TextTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('quran-media-maker');
  const { quranTextFontScale, translationFontScale } = mediaSettings;

  const onFontScaleIncreaseClicked = () => {
    const value = quranTextFontScale + 1;
    onSettingsUpdate({ quranTextFontScale: value }, 'quranTextFontScale', value);
  };

  const onFontScaleDecreaseClicked = () => {
    const value = quranTextFontScale - 1;
    onSettingsUpdate({ quranTextFontScale: value }, 'quranTextFontScale', value);
  };

  const onTranslationFontScaleDecreaseClicked = () => {
    const newValue = translationFontScale - 1;
    onSettingsUpdate({ translationFontScale: newValue }, 'translationFontScale', newValue);
  };

  const onTranslationFontScaleIncreaseClicked = () => {
    const newValue = translationFontScale + 1;
    onSettingsUpdate({ translationFontScale: newValue }, 'translationFontScale', newValue);
  };

  return (
    <Section>
      <Section.Title>{t('common:fonts.quran-font')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('common:fonts.quran-font-size')}</Section.Label>
        <Counter
          count={mediaSettings.quranTextFontScale}
          onDecrement={
            mediaSettings.quranTextFontScale === MINIMUM_FONT_STEP
              ? null
              : onFontScaleDecreaseClicked
          }
          onIncrement={
            mediaSettings.quranTextFontScale === MAXIMUM_QURAN_FONT_STEP
              ? null
              : onFontScaleIncreaseClicked
          }
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('common:fonts.translation-font-size')}</Section.Label>
        <Counter
          count={translationFontScale}
          onIncrement={
            MAXIMUM_TRANSLATIONS_FONT_STEP === translationFontScale
              ? null
              : onTranslationFontScaleIncreaseClicked
          }
          onDecrement={
            MINIMUM_FONT_STEP === translationFontScale
              ? null
              : onTranslationFontScaleDecreaseClicked
          }
        />
      </Section.Row>
    </Section>
  );
};

export default TextTab;
