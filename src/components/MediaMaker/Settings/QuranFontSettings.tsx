import useTranslation from 'next-translate/useTranslation';

import styles from '../MediaMaker.module.scss';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Counter from '@/dls/Counter/Counter';
import { MAXIMUM_QURAN_FONT_STEP, MINIMUM_FONT_STEP } from '@/redux/slices/QuranReader/styles';
import { ChangedSettings } from '@/types/Media/MediaSettings';

type Props = {
  onSettingsUpdate: (settings: ChangedSettings) => void;
  fontColor: string;
  quranTextFontScale: number;
};

const QuranFontSection: React.FC<Props> = ({ onSettingsUpdate, quranTextFontScale, fontColor }) => {
  const { t } = useTranslation('quran-media-maker');

  const onFontScaleDecreaseClicked = () => {
    const value = quranTextFontScale - 1;
    onSettingsUpdate({ quranTextFontScale: value });
  };

  const onFontScaleIncreaseClicked = () => {
    const value = quranTextFontScale + 1;
    onSettingsUpdate({ quranTextFontScale: value });
  };

  const onFontColorChange = (color: string) => {
    onSettingsUpdate({ fontColor: color });
  };

  return (
    <>
      <Section>
        <Section.Title>{t('colors')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('font-color')}</Section.Label>
          <input
            className={styles.colorPicker}
            type="color"
            value={fontColor}
            onChange={(e) => onFontColorChange(e.target.value)}
          />
        </Section.Row>
      </Section>
      <Section>
        <Section.Title>{t('common:fonts.quran-font')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('common:fonts.font-size')}</Section.Label>
          <Counter
            count={quranTextFontScale}
            onDecrement={
              quranTextFontScale === MINIMUM_FONT_STEP ? null : onFontScaleDecreaseClicked
            }
            onIncrement={
              quranTextFontScale === MAXIMUM_QURAN_FONT_STEP ? null : onFontScaleIncreaseClicked
            }
          />
        </Section.Row>
      </Section>
    </>
  );
};

export default QuranFontSection;
