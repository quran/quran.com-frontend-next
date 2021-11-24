import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './WordByWordSection.module.scss';

import Checkbox from 'src/components/dls/Forms/Checkbox/Checkbox';
import HelperTooltip from 'src/components/dls/HelperTooltip/HelperTooltip';
import {
  setShowTooltipFor,
  selectShowTooltipFor,
} from 'src/redux/slices/QuranReader/readingPreferences';
import { areArraysEqual } from 'src/utils/array';
import { WordByWordType } from 'types/QuranReader';

const WordTooltipSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const showTooltipFor = useSelector(selectShowTooltipFor, areArraysEqual);

  return (
    <Section>
      <Section.Title>
        {t('word-tooltip')}
        <HelperTooltip>{t('settings.wbw-tooltip')}</HelperTooltip>
      </Section.Title>
      <Section.Row>
        <div className={styles.checkboxContainer}>
          <div>
            <Checkbox
              checked={showTooltipFor.includes(WordByWordType.Translation)}
              id="word-tooltip-translation"
              name="word-tooltip-translation"
              label="Translation"
              onChange={(checked) => {
                const nexShowTooltipFortValue = new Set(showTooltipFor);
                if (!checked) nexShowTooltipFortValue.delete(WordByWordType.Translation);
                else nexShowTooltipFortValue.add(WordByWordType.Translation);
                dispatch(setShowTooltipFor(Array.from(nexShowTooltipFortValue)));
              }}
            />
          </div>
          <div>
            <Checkbox
              checked={showTooltipFor.includes(WordByWordType.Transliteration)}
              id="word-tooltip-transliteration"
              name="word-tooltip-transliteration"
              label="Transliteration"
              onChange={(checked) => {
                const nexShowTooltipFortValue = new Set(showTooltipFor);
                if (!checked) nexShowTooltipFortValue.delete(WordByWordType.Transliteration);
                else nexShowTooltipFortValue.add(WordByWordType.Transliteration);
                dispatch(setShowTooltipFor(Array.from(nexShowTooltipFortValue)));
              }}
            />
          </div>
        </div>
      </Section.Row>
    </Section>
  );
};

export default WordTooltipSection;
