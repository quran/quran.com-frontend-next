import { FC, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Counter from '@/dls/Counter/Counter';
import Select from '@/dls/Forms/Select';
import Separator from '@/dls/Separator/Separator';
import {
  MAXIMUM_QURAN_FONT_STEP,
  MAXIMUM_TRANSLATIONS_FONT_STEP,
  MINIMUM_FONT_STEP,
} from '@/redux/slices/QuranReader/styles';
import MediaSettings, { ChangedSettings } from '@/types/Media/MediaSettings';
import { QuranFont } from '@/types/QuranReader';

type TextTabProps = {
  mediaSettings: MediaSettings;
  onSettingsUpdate: (settings: ChangedSettings, key?: keyof MediaSettings, value?: any) => void;
};

const TextTab: FC<TextTabProps> = ({ mediaSettings, onSettingsUpdate }) => {
  const { t } = useTranslation('media');
  const { quranTextFontScale, translationFontScale, quranTextFontStyle } = mediaSettings;

  const types = useMemo(
    () =>
      [QuranFont.QPCHafs, QuranFont.IndoPak].map((font) => ({
        id: t(`common:fonts.${font}`),
        label: t(`common:fonts.${font}`),
        name: t(`common:fonts.${font}`),
        value: font,
      })),
    [t],
  );

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

  const onQuranFontStyleChange = (newValue) => {
    onSettingsUpdate({ quranTextFontStyle: newValue }, 'quranTextFontStyle', newValue);
  };

  return (
    <div className={styles.tabContainer}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('style')}</div>
        <div className={styles.selectContainer}>
          <Select
            id="quranTextFontStyle"
            name="quranTextFontStyle"
            options={types}
            value={quranTextFontStyle}
            onChange={onQuranFontStyleChange}
            className={styles.select}
          />
        </div>
      </div>
      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('common:fonts.quran-font-size')}</div>
        <div className={styles.counterContainer}>
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
        </div>
      </div>
      <div className={styles.separatorContainer}>
        <Separator isVertical />
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('common:fonts.translation-font-size')}</div>
        <div className={styles.counterContainer}>
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
        </div>
      </div>
    </div>
  );
};

export default TextTab;
