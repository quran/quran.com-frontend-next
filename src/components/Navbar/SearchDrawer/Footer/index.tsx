import React from 'react';

import styles from './Footer.module.scss';

import TarteelAttribution from '@/components/TarteelAttribution/TarteelAttribution';
import Separator from '@/dls/Separator/Separator';

const Footer: React.FC = () => {
  return (
    <div>
      <Separator />
      <div className={styles.container}>
        <TarteelAttribution />
      </div>
    </div>
  );
};

export default Footer;
