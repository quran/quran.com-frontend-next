import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ShareToQrCheckboxLabel.module.scss';

import HelperTooltip from '@/dls/HelperTooltip/HelperTooltip';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useCurrentUser from '@/hooks/auth/useCurrentUser';

const ShareToQrCheckboxLabel = () => {
  const {
    user: { firstName },
  } = useCurrentUser();
  const { t } = useTranslation('notes');
  return (
    <div>
      <div className={styles.container}>
        {t('share-to-qr')}
        <HelperTooltip>
          <Trans
            i18nKey="notes:qr-tooltip"
            components={{
              link: (
                <Link
                  key={0}
                  href="https://quranreflect.com"
                  variant={LinkVariant.Blend}
                  isNewTab
                />
              ),
              span: <span key={1} />,
            }}
          />
        </HelperTooltip>
      </div>
      <Trans
        i18nKey="notes:share-to-qr-desc"
        components={{
          b: <b className={styles.bold} key={0} />,
        }}
        values={{ name: `${firstName}` }}
      />
    </div>
  );
};

export default ShareToQrCheckboxLabel;
