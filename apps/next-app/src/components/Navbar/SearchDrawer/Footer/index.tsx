import React from 'react';

import styles from './Footer.module.scss';

import Separator from 'src/components/dls/Separator/Separator';
import TarteelAttribution from 'src/components/TarteelAttribution/TarteelAttribution';

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
