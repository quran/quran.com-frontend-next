import startCase from 'lodash/startCase';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import {
  CalculationMethod,
  Madhab,
  selectCalculationMethod,
  selectMadhab,
  setCalculationMethod,
  setMadhab,
} from 'src/redux/slices/prayerTimes';
import { generateSelectOptions } from 'src/utils/input';

const calculationMethodOptions = generateSelectOptions(
  Object.values(CalculationMethod).map(startCase),
);

const madhabOptions = generateSelectOptions([Madhab.Hanafi, Madhab.Shafi]);

const PrayerTimesSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const calculationMethod = useSelector(selectCalculationMethod);
  const madhab = useSelector(selectMadhab);

  return (
    <Section>
      <Section.Title>{t('prayer-times.title')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('prayer-times.calculation-method')}</Section.Label>
        <Select
          id="prayer-times-calculation-method"
          name="calculation-method"
          options={calculationMethodOptions}
          value={calculationMethod}
          onChange={(value) => dispatch(setCalculationMethod(value as CalculationMethod))}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('prayer-times.madhab')}</Section.Label>
        <Select
          id="prayer-times-madhab"
          name="madhab"
          options={madhabOptions}
          value={madhab}
          onChange={(value) => dispatch(setMadhab(value as Madhab))}
        />
      </Section.Row>
    </Section>
  );
};

export default PrayerTimesSection;
