import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import RightIcon from '../../../../public/icons/east.svg';

import Section from './Section';
import styles from './TranslationSection.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button from 'src/components/dls/Button/Button';
import Counter from 'src/components/dls/Counter/Counter';
import { setSettingsView, SettingsView } from 'src/redux/slices/navbar';
import {
  decreaseTranslationFontScale,
  increaseTranslationFontScale,
  MAXIMUM_FONT_STEP,
  MINIMUM_FONT_STEP,
  QuranReaderStyles,
  selectQuranReaderStyles,
} from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { makeTranslationsUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { TranslationsResponse } from 'types/ApiResponses';

const TranslationSection = () => {
  const { t, lang } = useTranslation('common');
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
          <Section.Label>{t('translations')}</Section.Label>
          <DataFetcher
            queryKey={makeTranslationsUrl(lang)}
            render={(data: TranslationsResponse) => {
              return (
                <div>
                  {selectedTranslations.map((translationId) => {
                    const selectedTranslation = data.translations.find(
                      (translation) => translation.id === translationId,
                    );
                    return <div>{selectedTranslation.name}</div>;
                  })}
                </div>
              );
            }}
          />
        </Section.Row>
        <div className={styles.chooseReciterButtonContainer}>
          <Button
            onClick={() => dispatch(setSettingsView(SettingsView.Translation))}
            suffix={<RightIcon />}
          >
            {t('settings.change-translations')}
          </Button>
        </div>
      </Section>
    </div>
  );
};
export default TranslationSection;
