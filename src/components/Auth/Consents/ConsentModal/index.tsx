import React from 'react';

import Trans from 'next-translate/Trans';

import ConsentBody from '../ConsentBody';

import styles from './ConsentModal.module.scss';

import ConsentType from '@/types/auth/ConsentType';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  consentType: ConsentType;
  isLoading: boolean;
  onCompleted: (consentType: ConsentType, consented: boolean) => void;
};

const ConsentModal: React.FC<Props> = ({ onCompleted, consentType, isLoading }) => {
  const onButtonClicked = (consented: boolean) => {
    logButtonClick(`${consentType}_${consentType}`);
    onCompleted(consentType, consented);
  };

  return (
    <ConsentBody onButtonClicked={onButtonClicked} isLoading={isLoading}>
      <p className={styles.header}>
        <Trans
          components={{ boldSpan: <span key={0} className={styles.boldSpan} /> }}
          i18nKey={`common:consents.${consentType}.header`}
        />
      </p>
      <Trans
        components={{
          br: <br key={0} />,
          boldSpan: <span key={1} className={styles.boldSpan} />,
        }}
        i18nKey={`common:consents.${consentType}.body`}
      />
    </ConsentBody>
  );
};

export default ConsentModal;
