import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import Toggle from 'src/components/dls/Toggle/Toggle';
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
import { logPrayerTimesSettingsChangeEvent } from 'src/utils/eventLogger';

const PrayerTimesSection = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const locationAccess = useSelector(selectLocationAccess);
  const isLocationAccessEnabled = locationAccess === LocationAccess.On;

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

  const onCalculationMethodChange = (value) => {
    logPrayerTimesSettingsChangeEvent('calculation_method', value);
    dispatch(setCalculationMethod(value as CalculationMethod));
  };

  const onMadhabChange = (value) => {
    logPrayerTimesSettingsChangeEvent('madhab', value);
    dispatch(setMadhab(value as Madhab));
  };

  const onLocationAccessChange = () => {
    const newValue = isLocationAccessEnabled ? LocationAccess.Off : LocationAccess.On;
    logPrayerTimesSettingsChangeEvent('location_access', newValue);
    dispatch(setLocationAccess(newValue));
  };

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
          onChange={onCalculationMethodChange}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('prayer-times.madhab')}</Section.Label>
        <Select
          id="prayer-times-madhab"
          name="madhab"
          options={madhabOptions}
          value={selectedMadhab}
          onChange={onMadhabChange}
        />
      </Section.Row>
      <Section.Row>
        <Section.Label>{t('prayer-times.location-access')}</Section.Label>
        <Toggle isChecked={isLocationAccessEnabled} onClick={onLocationAccessChange} />
      </Section.Row>
    </Section>
  );
};

export default PrayerTimesSection;
