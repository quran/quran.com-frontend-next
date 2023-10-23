import React, { useState } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import ConsentBody from '../ConsentBody';

import styles from './CommunicationConsent.module.scss';

import Switch from '@/dls/Switch/Switch';
import ConsentType from '@/types/auth/ConsentType';

type Props = {
  consentType: ConsentType;
  isLoading: boolean;
  onCompleted: (consentType: ConsentType, consented: boolean) => void;
};

const CommunicationConsent: React.FC<Props> = ({ onCompleted, consentType, isLoading }) => {
  const [selected, setSelected] = useState('true');
  const { t } = useTranslation('common');

  const ITEMS = [
    { name: t('allow'), value: 'true' },
    { name: t('not-now'), value: 'false' },
  ];

  const onSubmitClicked = () => {
    onCompleted(consentType, selected === 'true');
  };
  return (
    <ConsentBody onSubmitClicked={onSubmitClicked} isLoading={isLoading}>
      <p className={styles.header}>
        <Trans
          components={{ boldSpan: <span key={0} className={styles.boldSpan} /> }}
          i18nKey="common:consents.communication.header"
        />
      </p>
      <p className={styles.section}>
        <Trans
          components={{
            br: <br key={0} />,
            boldSpan: <span key={1} className={styles.boldSpan} />,
          }}
          i18nKey="common:consents.communication.body"
        />
      </p>

      <Switch items={ITEMS} selected={selected} onSelect={setSelected} />
    </ConsentBody>
  );
};

export default CommunicationConsent;
