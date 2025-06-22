import React from 'react';

import Trans from 'next-translate/Trans';

import loginStyles from './login.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import { ROUTES } from '@/utils/navigation';

/**
 * A reusable component for displaying the privacy policy and terms text
 * @returns {React.ReactElement} A paragraph element with privacy policy and terms text
 */
const PrivacyPolicyText = () => {
  return (
    <p className={loginStyles.privacyText}>
      <Trans
        i18nKey="login:privacy-policy"
        components={{
          link: <Link href={ROUTES.PRIVACY} isNewTab variant={LinkVariant.Blend} />,
          link1: <Link href={ROUTES.TERMS} isNewTab variant={LinkVariant.Blend} />,
        }}
      />
    </p>
  );
};

export default PrivacyPolicyText;
