import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import RightIcon from '../../../../public/icons/east.svg';

import Section from './Section';
import styles from './TranslationSection.module.scss';

import Button from 'src/components/dls/Button/Button';
import Counter from 'src/components/dls/Counter/Counter';
import {
  decreaseTranslationFontScale,
  increaseTranslationFontScale,
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { areArraysEqual } from 'src/utils/array';

const TranslationSection = ({ onChooseTranslation }) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { translationFontScale } = quranReaderStyles;

  return (
    <div className={styles.container}>
      <Section>
        <Section.Title>{t('translation')}</Section.Title>
        <Section.Row>
          <Section.Label>{t('fonts.font-size')}</Section.Label>

          {/* disable `onIncrement` function and UI, when translationFontScale is MAXIMUM_FONT_SCALE
            we do this by giving null to `onIncrement` prop
            same applies to `onDecrement` */}
          <Counter
            count={translationFontScale}
            onIncrement={
              MAXIMUM_FONT_STEP === translationFontScale
                ? null
                : () => dispatch(increaseTranslationFontScale())
            }
            onDecrement={
              MINIMUM_FONT_STEP === translationFontScale
                ? null
                : () => dispatch(decreaseTranslationFontScale())
            }
          />
        </Section.Row>
        <Section.Row>
          <Section.Label>Translations</Section.Label>
          <div>Showing {selectedTranslations.length} translations</div>
        </Section.Row>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
          <Button onClick={onChooseTranslation} suffix={<RightIcon />}>
            Choose Translation
          </Button>
        </div>
      </Section>
    </div>
  );
};
export default TranslationSection;
