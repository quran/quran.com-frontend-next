import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './TafsirSection.module.scss';

import BigSelect from 'src/components/dls/BigSelect/BigSelect';
import Counter from 'src/components/dls/Counter/Counter';
import { setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import {
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  selectQuranReaderStyles,
  increaseTafsirFontScale,
  decreaseTafsirFontScale,
} from 'src/redux/slices/QuranReader/styles';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';

const TafsirSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { tafsirFontScale } = quranReaderStyles;

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('tafsir.title')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('tafsir.font-size')}</Section.Label>
          <Counter
            count={tafsirFontScale}
            onDecrement={
              tafsirFontScale === MINIMUM_FONT_STEP
                ? null
                : () => dispatch(decreaseTafsirFontScale())
            }
            onIncrement={
              tafsirFontScale === MAXIMUM_FONT_STEP
                ? null
                : () => dispatch(increaseTafsirFontScale())
            }
          />
        </Section.Row>
        <Section.Row>
          <BigSelect
            value="mam"
            label="Selected Tafsir"
            onClick={() => dispatch(setSettingsView(SettingsView.Tafsir))}
          />
        </Section.Row>
      </Section>
    </div>
  );
};

export default TafsirSection;
