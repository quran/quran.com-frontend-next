import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from '../video.module.scss';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Counter from '@/dls/Counter/Counter';
import { MAXIMUM_QURAN_FONT_STEP, MINIMUM_FONT_STEP } from '@/redux/slices/QuranReader/styles';
import {
  selectFontColor,
  selectQuranTextFontScale,
  updateSettings,
} from '@/redux/slices/videoGenerator';

const QuranFontSection = () => {
  const { t } = useTranslation('quran-media-creator');
  const dispatch = useDispatch();
  const quranTextFontScale = useSelector(selectQuranTextFontScale, shallowEqual);
  const fontColor = useSelector(selectFontColor, shallowEqual);

  const onFontScaleDecreaseClicked = () => {
    const value = quranTextFontScale - 1;
    dispatch(updateSettings({ quranTextFontScale: value }));
  };

  const onFontScaleIncreaseClicked = () => {
    const value = quranTextFontScale + 1;
    dispatch(updateSettings({ quranTextFontScale: value }));
  };

  const onFontColorChange = (color: string) => {
    dispatch(updateSettings({ fontColor: color }));
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
