import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import BenefitSection from './BenefitSection';

const AccessAnywhere: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <BenefitSection id="access-anywhere" number={3} title={t('benefits.access-anywhere.title')}>
      <p>{t('benefits.access-anywhere.login-prompt')}</p>
      <ul>
        {[
          { id: 'sync', text: t('benefits.access-anywhere.bullet-points.0') },
          { id: 'device', text: t('benefits.access-anywhere.bullet-points.1') },
        ].map(({ id, text }) => (
          <li key={`aa-${id}`}>{text}</li>
        ))}
      </ul>
    </BenefitSection>
  );
};

export default AccessAnywhere;
