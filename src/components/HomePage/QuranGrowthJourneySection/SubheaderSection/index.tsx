import React from 'react';

import Trans from 'next-translate/Trans';

import styles from './SubheaderSection.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

const SubheaderSection = () => {
  // TODO: text needs to change based on logged in/out

  const onLoginLinkClicked = () => {
    logButtonClick('homepage_qgj_login');
  };

  return (
    <div className={styles.container}>
      <Trans
        i18nKey="home:qgj.desc.logged-out"
        components={{
          bold: <span key={0} className={styles.bold} />,
          link: (
            <Link
              onClick={onLoginLinkClicked}
              key={1}
              href={getLoginNavigationUrl()}
              variant={LinkVariant.Blend}
            />
          ),
        }}
      />
    </div>
  );
};

export default SubheaderSection;
