import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import RadioGroup, { RadioGroupOrientation } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import Select from 'src/components/dls/Forms/Select';
import {
  CalculationMethod,
  LocationAccess,
  Madhab,
  selectCalculationMethod,
  selectLocationAccess,
  selectMadhab,
  setCalculationMethod,
  setLocationAccess,
  setMadhab,
} from 'src/redux/slices/prayerTimes';

const PrayerTimesSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const locationAccess = useSelector(selectLocationAccess);

  const onLocationAccessChange = (value: string) => {
    if (value === LocationAccess.On) dispatch(setLocationAccess(LocationAccess.On));
    if (value === LocationAccess.Off) dispatch(setLocationAccess(LocationAccess.Off));
  };

  const locationAccessOptions = useMemo(
    () =>
      Object.values(LocationAccess).map((item) => ({
        label: t(item), // 'On' or 'Off'
        id: item,
        value: item,
      })),
    [t],
  );
  const selectedCalculationMethod = useSelector(selectCalculationMethod);
  const selectedMadhab = useSelector(selectMadhab);

  const calculationMethodOptions = useMemo(
    () =>
      Object.values(CalculationMethod).map((calculationMethod) => ({
        label: t(`prayer-times.calculation-methods.${calculationMethod}`),
        value: calculationMethod,
      })),
    [t],
  );

  const madhabOptions = useMemo(
    () =>
      Object.values(Madhab).map((madhab) => ({
        value: madhab,
        label: t(`prayer-times.madhabs.${madhab}`),
      })),
    [t],
  );

  return (
    <Section>
      <Section.Title>{t('prayer-times.title')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('prayer-times.calculation-method')}</Section.Label>
        <Select
          id="prayer-times-calculation-method"
          name="calculation-method"
          options={calculationMethodOptions}
          value={selectedCalculationMethod}
          onChange={(value) => dispatch(setCalculationMethod(value as CalculationMethod))}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('prayer-times.madhab')}</Section.Label>
        <Select
          id="prayer-times-madhab"
          name="madhab"
          options={madhabOptions}
          value={selectedMadhab}
          onChange={(value) => dispatch(setMadhab(value as Madhab))}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('prayer-times.location-access')}</Section.Label>
        <RadioGroup
          orientation={RadioGroupOrientation.Horizontal}
          label="location access"
          name="location-access"
          items={locationAccessOptions}
          value={locationAccess}
          onChange={onLocationAccessChange}
        />
      </Section.Row>
    </Section>
  );
};

export default PrayerTimesSection;
