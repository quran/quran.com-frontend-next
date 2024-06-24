import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';

import styles from '../video.module.scss';

import Section from '@/components/Navbar/SettingsDrawer/Section';
import Switch from '@/dls/Switch/Switch';
import { selectOrientation, updateSettings } from '@/redux/slices/videoGenerator';
import { Orientation } from '@/utils/videoGenerator/constants';

const OrientationSettings = () => {
  const { t } = useTranslation('quran-media-creator');
  const orientation = useSelector(selectOrientation);
  const dispatch = useDispatch();

  const onOrientationChange = (val: Orientation) => {
    dispatch(updateSettings({ orientation: val }));
  };

  return (
    <Section>
      <Section.Title>{t('orientation')}</Section.Title>
      <Section.Row>
        <Switch
          items={[
            { name: t(Orientation.LANDSCAPE), value: Orientation.LANDSCAPE },
            { name: t(Orientation.PORTRAIT), value: Orientation.PORTRAIT },
          ]}
          selected={orientation}
          onSelect={onOrientationChange}
        />
      </Section.Row>
      <Section.Row>
        <div className={styles.orientationWrapper}>
          <div
            className={orientation === Orientation.LANDSCAPE ? styles.landscape : styles.portrait}
          />
        </div>
      </Section.Row>
    </Section>
  );
};

export default OrientationSettings;
