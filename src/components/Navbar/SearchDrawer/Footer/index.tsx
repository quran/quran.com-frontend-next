import React from 'react';

import { useSelector, shallowEqual } from 'react-redux';

import styles from './Footer.module.scss';

import TarteelAttribution from '@/components/TarteelAttribution/TarteelAttribution';
import Separator from '@/dls/Separator/Separator';
import { selectIsSearchDrawerVoiceFlowStarted } from '@/redux/slices/voiceSearch';

const Footer: React.FC = () => {
  const isVoiceSearchFlowStarted = useSelector(selectIsSearchDrawerVoiceFlowStarted, shallowEqual);
  return (
    <>
      {isVoiceSearchFlowStarted ? (
        <div className={styles.container}>
          <Separator />
          <TarteelAttribution />
        </div>
      ) : (
        <div className={styles.container} />
      )}
    </>
  );
};

export default Footer;
